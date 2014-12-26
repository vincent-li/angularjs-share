const SLIDE_CLASSES = ['far-past', 'past', 'current', 'next', 'far-next'];
var buildTime = 0;
/* Slide movement */
function getSlideEl(no) {
    if ((no < 0) || (no >= slideEls.length)) {
        return null;
    } else {
        return slideEls[no];
    }
};

function updateSlideClass(slideNo, className) {
    var el = getSlideEl(slideNo);

    if (!el) {
        return;
    }

    if (className) {
        el.classList.add(className);
    }

    for (var i in SLIDE_CLASSES) {
        if (className != SLIDE_CLASSES[i]) {
            el.classList.remove(SLIDE_CLASSES[i]);
        }
    }
};

function updateSlides(opt_dontPush) {
    var dontPush = opt_dontPush || false;

    for (var i = 0; i < slideEls.length; i++) {
        switch (i) {
            case curSlide - 2:
              updateSlideClass(i, 'far-past');
              break;
            case curSlide - 1:
              updateSlideClass(i, 'past');
              break;
            case curSlide:
              updateSlideClass(i, 'current');
              break;
            case curSlide + 1:
              updateSlideClass(i, 'next');
              break;
            case curSlide + 2:
              updateSlideClass(i, 'far-next');
              break;
            default:
              updateSlideClass(i);
              break;
        }
    }

    triggerLeaveEvent(curSlide - 1);
    triggerEnterEvent(curSlide);

    updateHash(dontPush);
};

function buildNextItem() {
    var toBuild = slideEls[curSlide].querySelectorAll('.build-fade');
    if (toBuild && toBuild.length && buildTime < toBuild.length) {
        TweenMax.to(toBuild[buildTime], 0.6, {rotationX:0});
        buildTime++;
        return true;  
    }
    // var tl  = new TimeLineMax();
    return false;
};
function buildOrignItem() {
    var toBuild = slideEls[curSlide].querySelectorAll('.build-fade');
    if (toBuild && toBuild.length) {
        TweenMax.staggerTo(toBuild, 0.4, {rotationX:-90});
        buildTime = 0; 
    }
};
var animates = [
    function(){
        myApp.changeScene(SelectRole.scene);
    },
    function(){
        myApp.changeScene(ManFight.scene);
    }
];
var animate_index = 0;
function prevSlide(opt_dontPush) {
    if (curSlide > 0) {
        curSlide--;
        updateSlides(opt_dontPush);
        buildOrignItem();
    }
};

function nextSlide(opt_dontPush) {
    if (buildNextItem()) {
        return;
    }
    if (curSlide < slideEls.length - 1) {
        curSlide++;
        updateSlides(opt_dontPush);
        buildOrignItem();
    }
};

/* Slide events */

function triggerEnterEvent(no) {
    var el = getSlideEl(no);
    if (!el) {
        return;
    }

    var onEnter = el.getAttribute('onslideenter');
    if (onEnter) {
        new Function(onEnter).call(el);
    }

    var evt = document.createEvent('Event');
    evt.initEvent('slideenter', true, true);
    evt.slideNumber = no + 1; // Make it readable

    el.dispatchEvent(evt);
};

function triggerLeaveEvent(no) {
    var el = getSlideEl(no);
    if (!el) {
        return;
    }

    var onLeave = el.getAttribute('onslideleave');
    if (onLeave) {
        new Function(onLeave).call(el);
    }

    var evt = document.createEvent('Event');
    evt.initEvent('slideleave', true, true);
    evt.slideNumber = no + 1; // Make it readable

    el.dispatchEvent(evt);
};

function setupInteraction() {
  /* Clicking and tapping */

    var slides = document.querySelector('section.slides');

    var el = document.createElement('div');
    el.className = 'slide-area';
    el.id = 'prev-slide-area';
    el.addEventListener('click', prevSlide, false);
    slides.appendChild(el);

    var el = document.createElement('div');
    el.className = 'slide-area';
    el.id = 'next-slide-area';
    el.addEventListener('click', nextSlide, false);
    slides.appendChild(el);
}

/* Hash functions */

function getCurSlideFromHash() {
    var slideNo = parseInt(location.hash.substr(1));

    if (slideNo) {
        curSlide = slideNo;
    } else {
        curSlide = 0;
    }
};

function updateHash(dontPush) {
    if (!dontPush || (dontPush.type && dontPush.type==='click')) {
        var slideNo = curSlide;
        var hash = '#' + slideNo;
        if (window.history.pushState) {
            window.history.pushState(slideNo, 'Slide ' + slideNo, hash);
        } else {
            window.location.replace(hash);
        }
    }
};

/* Event listeners */

function handleBodyKeyDown(event) {
    switch (event.keyCode) {
        case 39: // right arrow
        // case 32: // space
        case 34: // PgDn
            nextSlide();
            event.preventDefault();
        break;

        case 37: // left arrow
        // case 8: // Backspace
        case 33: // PgUp
            prevSlide();
            event.preventDefault();
        break;

        case 40: // down arrow
            nextSlide();
            event.preventDefault();
        break;

        case 38: // up arrow
            prevSlide();
            event.preventDefault();
        break;

        case 13: // Enter
        case 70: // F
            // Only respect 'f'/enter on body. Don't want to capture keys from <input>
            if (event.target == document.body) {
                if (event.keyCode != 13 && !document.webkitIsFullScreen) {
                    document.body.webkitRequestFullScreen();
                } else {
                    document.webkitCancelFullScreen();
                }
            }
        break;
  }
};

function handlePopState(event) {
    if (event.state != null) {
        curSlide = event.state - 1;
        updateSlides(true);
    }
};

function addEventListeners() {
  document.addEventListener('keydown', handleBodyKeyDown, false);
  window.addEventListener('popstate', handlePopState, false);
};

/* Initialization */

function handleDomLoaded() {
    slideEls = document.querySelectorAll('section.slides > article:not(.hidden)');

    addEventListeners();

    updateSlides();

    setupInteraction();

    document.body.classList.add('loaded');
};

function initialTween(){
    var bils = document.querySelectorAll('.build-fade');
    for (var i = bils.length - 1; i >= 0; i--) {
        var pa = $(bils[i]).parent();
        TweenMax.set(pa, {perspective:500});
        TweenMax.set($(bils[i]),{transformPerspective:500,});
    };
}

function initialize() {
    initialTween();
    getCurSlideFromHash();
    document.addEventListener('DOMContentLoaded', handleDomLoaded, false);
}

initialize();
