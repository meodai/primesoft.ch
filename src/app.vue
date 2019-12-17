// App.vue

<template>
  <design class="container" :class="{'is-home': isHome}" :style="{'--scrollProgress': scrollProgress}">
    <div @click.prevent="videoCollapsed = true;" ref="homevideo" class="homevideo" :class="{'homevideo--collapsed': videoCollapsed}" v-if="isHome">
      <div v-if="contents">
        <Video :collapse="videoCollapsed" @ended="collapse" :src="contents.heroVideo" :autoplay="true" :muted="true" playsinline></Video>
        <div ref="hero" class="homevideo__hero" v-html="heroText"></div>
        <div ref="videoTimeline" class="homevideo__loader"></div>
      </div>
    </div>
    <MainHeader 
      :nav='navigationItems'
      :headerText='headerTxt'
      :homeReady='homeReady'
      :footerText='footerText'
    ></MainHeader>
    <main class="main">
      <router-view></router-view>
    </main>
    <footer class="footer js-footer">
      <div class="footer__claim" v-if="footerReady" v-html="footerText"></div>
    </footer>

    <div class="loader" :class="{'loader--loaded': loaded}">
      <div class="spinner">
        <div class="frame">
          <div class="strip">
            <div class="strip-a">H</div>
            <div class="strip-b">O</div>
            <div class="strip-c">C</div>
            <div class="strip-d">H</div>
            <div class="strip-e">S</div>
            <div class="strip-f">P</div>
            <div class="strip-g">A</div>
            <div class="strip-h">N</div>
            <div class="strip-i">N</div>
            <div class="strip-j">U</div>
            <div class="strip-k">N</div>
            <div class="strip-l">G</div>
          </div>
        </div>
      </div>
    </div>

  </design>
</template>

<script lang="ts">
import Vue from "vue";
import Logo from "./components/logo.vue";
import Design from "./components/design.vue";
import MainHeader from "./components/header.vue";
import Video from "./components/video.vue";
import routes from "./js/routes";
import {ax, baseURL} from "./js/api";
import { assertSwitchCase } from "babel-types";
import anime from 'animejs/lib/anime.es.js';


export default Vue.extend({
  components: {
    Logo,
    MainHeader,
    Design,
    Video,
  },
  data() {
    return {
      name: "wrapper",
      isLogoVisible: false,
      navigationItems: routes,
      scrollProgress: 0,
      currentPage: '',
      videoCollapsed: false,
      footerTexts: [],
      contents: null,
      headerTxt: '',
      homeReady: false,
      loaded: false,
      letters: 'HOCHSPANNUNG'.split(''),
      letterIndex: 0,
      lastX: 0,
      lastY: 0,
      introMovieDuration: '1s',
      footerReady: false,
    };
  },
  metaInfo () { 
    return {
      title: 'Hochspannung',
      htmlAttrs: {
        lang: 'en',
      }
    }
  },
  mounted () {
    this.updateScrollHeight();
    this.startScrollListener();

    window.addEventListener('mousemove', this.drawtrail, true);

    document.body.addEventListener('load', () => {
      this.updateScrollHeight();
    }, true);

    window.addEventListener('resize', () => {
      this.updateScrollHeight();  
    });

    if ( this.isHome ) {
      this.$refs.homevideo.addEventListener('loadeddata', (e) => {

        this.animateHero();

        if (e.target && e.target.duration ) {
          
          const tl = anime.timeline();
          
          tl.add({
            targets: this.$refs.videoTimeline,
            scaleX: 0,
            duration: e.target.duration * 1000,
            easing: 'linear',
          });
        }

        setTimeout(() => {
          this.loaded = true;
        }, 1000);
      }, true);
    } else {
        setTimeout(() => {
          this.loaded = true;
        }, 1000);
    }
  },
  created() {
    ax.get(`${baseURL}/api/footer`).then(response => {
      this.footerTexts = response.data.footerTexts;
      this.footerReady = true;
    })

    ax.get(`${baseURL}/api/home`).then(response => {
      this.contents = response.data;
      
      this.headerTxt = response.data.headerText;
    })
    .catch(function (error) {
      //console.error(error);
    })
    .finally(() => {
      this.homeReady = true;
      // always executed
    });

    ax.get(`${baseURL}/api/meta`).then(response => {
      document.querySelector('meta[name=description]').setAttribute('content', response.data.description);
      document.querySelector('meta[property="og:description"]').setAttribute('content', response.data.description);
      document.querySelector('meta[property="twitter:description"]').setAttribute('content', response.data.description);
    });
  },
  methods: {
    drawtrail: function (e) {
      if (!e.target.classList.contains('related') && !e.target.closest('.related')) return;

      const x = e.clientX;
      const y = e.clientY;

      const a = x - this.lastX;
      const b = y - this.lastY;

      const dist = Math.sqrt( a*a + b*b );

      if( dist < 40 ) return;

      this.lastX = x;
      this.lastY = y;

      if (this.letterIndex > this.letters.length) {
        this.letterIndex = 0;
      }

      const letter = this.letters[this.letterIndex];

      const $letter = document.createElement('div');
      $letter.textContent = letter;
      $letter.classList.add('floatyletter')
      $letter.style.setProperty('top', `${y}px`);
      $letter.style.setProperty('left', `${x}px`);

      document.documentElement.appendChild($letter);
      
      const tl = anime.timeline();
      tl.add({
        targets: $letter,
        scale: 0,
        opacity: 0,
        duration: 10,
      })

      tl.add({
        opacity: 1,
        targets: $letter,
        scale: 1,
        duration: 1000,
        translateY: -50,
        easing: 'cubicBezier(0.52, 0.01, 0.16, 1)', 
      });

      tl.add({
        targets: $letter,
        scale: 0,
        opacity: 0,
        duration: 200,
        translateY: 100,
        easing: 'cubicBezier(0.52, 0.01, 0.16, 1)',
      })

      tl.finished.then(() => {
        document.documentElement.removeChild($letter);
      });

      this.letterIndex++;

    },
    animateHero: function () {
      const $frags = this.$refs.hero.querySelector('.homevideo__textfragments');
      let children = [];
      let elements = 0;

      if ($frags) {
        children = Array.from($frags.children);
        elements = children.length;

        children.forEach((child, i) => {
          setTimeout(() => {
            if (children[i - 1]) {
              children[i - 1].classList.remove('visible');
            }
            children[i].classList.add('visible');
          }, i * 50);
        });

      };

      const $textEnd = this.$refs.hero.querySelector('.homevideo__textend');

      if ($textEnd && elements) {
        $textEnd.style.display = 'block';
        
        setTimeout(() => {
          $textEnd.classList.add('homevideo__textend--show');
        }, elements * 50);
      };

    },
    collapse: function () {
      this.videoCollapsed = true;
    },
    updatePageType: function () {
      if ( this.$route.path == '/' ) {
        this.currentPage = 'home';
      } else {
        this.currentPage = this.$route.name;
      }
    },
    startScrollListener: function () {
      let last_known_scroll_position = 0;
      let ticking = false;

      const updateScroll = (scroll_pos) => {
        this.scrollProgress = scroll_pos / (this.scrollHeight - this.winHeight);
        window.scrollProgress = this.scrollProgress;
        window.scrollTop = scroll_pos;
        window.scrollHeight = this.scrollHeight;
      };

      window.addEventListener('scroll', function(e) {
        last_known_scroll_position = window.scrollY;

        if (!ticking) {
          window.requestAnimationFrame(function() {
            updateScroll(last_known_scroll_position);
            ticking = false;
          });

          ticking = true;
        }
      });
    },
    updateScrollHeight: function () {
      this.scrollHeight = document.querySelector('body').scrollHeight;
      this.winHeight = window.innerHeight;
    },
    toggle: function () {
      this.isLogoVisible = !this.isLogoVisible;
    },
  },
  computed: {
    headerText: function () {
      if (this.contents) {
        return this.headerTxt;
      } else {
        return '';
      }
    },
    heroText: function() {
      //[sit,amet,bla,hallo,test]
      const bracketsReg = new RegExp(/\[(.*?)\]/);
      const fadeinReg = new RegExp(/\((.*?)\)/);

      let introTextHTML = this.contents.heroText || '';

      if ( this.contents.heroText && bracketsReg.test(this.contents.heroText) ) {
        let textfragments = bracketsReg.exec(this.contents.heroText);
        let textfragment = `<span class="homevideo__textfragments"><span class="visible">${textfragments[1].replace(/,/g, '</span><span>')}</span></span>`;
        introTextHTML = this.contents.heroText.replace(bracketsReg, textfragment);
      } 

      if ( this.contents.heroText && fadeinReg.test(this.contents.heroText) ) {
        let textfragments = fadeinReg.exec(this.contents.heroText);
        let textfragment = introTextHTML.replace(textfragments[0], `<span class="homevideo__textend">${textfragments[1]}</span>`);
        introTextHTML = textfragment;
      }

      return introTextHTML;
    },
    isHome: function() {
      return this.$route.path === '/';
    },
    footerText: function() {
      let response = null;
      
      if (this.footerTexts.length) {
        response = this.footerTexts.find(ft => ft.slug === this.$route.path );

        if (!response) {
          response = this.footerTexts.find(ft => this.$route.path.includes(ft.slug) );
        }
      }

      if (response) {
        return response.text;
      } else {
        return '';
      }
    },
  }
});
</script>

<style lang="scss">
  @import './styles/_toolbox';

  .main {
    min-height: 101vh;
    padding-top: var(--size-design-gutter);

    .is-home & {
      padding-top: 0;
    }
    
    transition: transform 1200ms cubic-bezier(0.52, 0.01, 0.16, 1);

    &.is-expanded {
      transform: translateY(150vh);
    }

    .hipster-mode & {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        height: var(--size-design-gutter);
        border: solid fuchsia;
        border-width: 2px 0;
        background: linear-gradient(90deg, transparent 50%, fuchsia calc(50% + 1px), transparent calc(50% + 3px));
      }
    }
  }

  .footer {
    margin-top: var(--size-content-stack--large);
    height: 100vh;
    position: relative;
    background: var(--c-brand);
    z-index: -1;
    overflow: hidden;
    
    &__claim {
      z-index: 100;
      position: absolute;
      top: calc(var(--scrollProgress) * 50%);
      left: 50%;
      width: 80%;
      transform: translate(-50%, -50%);
      font-size: var(--size-font-size--hero);
      @include viewport(phone) {
        font-size: calc(var(--size-font-size--hero) * .8);
      }
      will-change: top;

      a {
        text-decoration: underline;
      }
    }
  }

  .homevideo {
    position: relative;
    overflow: hidden;
    height: 100vh;
    will-change: height;
    transition: 1000ms height cubic-bezier(0.52, 0.01, 0.16, 1);

    &__loader {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      z-index: 10;
      will-change: transform;
      background: var(--c-brand);
      transform-origin: 0 0;
    }

    &__textfragments {
      span {
        display: none;

        &.visible {
          display: inline-block;
        }
      }
    }

    &__textend {
      display: none;
      opacity: 0;
      transition: 200ms opacity linear 400ms;
      
      &--show {
        opacity: 1;
      }
    }

    &--collapsed {
      height: 0;
    }

    &__hero {
      position: absolute;
      width: 80%;
      top: 50%; 
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      font-size: 8rem;
      color: var(--c-bg);
    }
  }

.loader {
  z-index: 100;
  position: fixed;
  background: var(--c-bg);
  top: 0;
  height: 100%;
  right: 0;
  left: 0;
  overflow: hidden;
  transition: height 1000ms cubic-bezier(0.52, 0.01, 0.16, 1) 200ms;

  --tz: 100px;
  --o: 1;

  &--loaded {
    height: 0;

    --tz: 30px;
    --o: 0;
  } 

  .spinner {
    pointer-events: none;
    position: absolute;
    top: 50%;
    left: 50%;
    text-align:center;
    margin:0 auto;
    perspective: 1900px;
    font-size: 60px;

    z-index: 0;

    @include viewport(phone) {
      transform: scale(.6);
    }

  }

  .frame {
    transform-origin: 50% 50% 100%;
    transform-style: preserve-3d;
  }
    
  .strip {
    transform-style: preserve-3d;
    will-change: transform;
    transform-origin: 50% 50% 50%;
    animation: spin 25s infinite linear;	
  }

  .strip div {
    opacity: var(--o);
    position: absolute;
    transform-origin: 50% 50% 0px;
    transition: 300ms transform ease-in, 150ms opacity linear;
  }


  .strip-a {
      transform: rotateY(0deg) translateZ(var(--tz));
  }
      
  .strip-b {
      transform: rotateY(30deg) translateZ(var(--tz));
  }
    
  .strip-c {
      transform: rotateY(60deg) translateZ(var(--tz));
  }
    
  .strip-d {
      transform: rotateY(90deg) translateZ(var(--tz));
  }	
    
  .strip-e {
      transform: rotateY(120deg) translateZ(var(--tz));
  }	
    
  .strip-f {
      transform: rotateY(150deg) translateZ(var(--tz));
  }
    
  .strip-g {
      transform: rotateY(180deg) translateZ(var(--tz));
  }
    
  .strip-h {
      transform: rotateY(210deg) translateZ(var(--tz));
  }	
    
  .strip-i {
      transform: rotateY(240deg) translateZ(var(--tz));
  }	
    
  .strip-j {
      transform: rotateY(270deg) translateZ(var(--tz));
  }
    
  .strip-k {
      transform: rotateY(300deg) translateZ(var(--tz));
  }
      
  .strip-l {
      transform: rotateY(330deg) translateZ(var(--tz));
  }
}


@keyframes spin {
	from { transform: rotateY(0)}
	to   { transform: rotateY(-360deg)}
}

	
</style>