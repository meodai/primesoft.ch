let letsMove = false;

function iLikeToMoveItMoveIt() {}

document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('window')) {
      letsmove = true;
    }
  }
)

document.addEventListener('mouseup', (e) => {
    letsmove = false;
  }
)