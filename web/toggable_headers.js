function toggableHeaders() {
  // Return if no headers are specified
  if (toggableHeadersList.length == 0) return;
  toggableHeadersList.forEach(function (header) {
    $(header).each(function () {
      var level = $(this).prop("tagName").toLowerCase().substring(1); // get the number from h1, h2, h3, etc.
      $(this).wrapAll("<div class='accordion level-" + level + "'></div>");
    });
  });

  // Add tabindex to headers
  $("div.accordion").each(function () {
    $(this).attr("tabindex", 0);
  });

  // wrapContentInPanels
  // for (var i = toggableHeadersList.length - 1; i >= 0; i--) {
  //     var level = i + 1;
  //     var accordions = $("div.accordion.level-" + level);
  //     accordions.each(function (index) {
  //         var elementsToWrap = index !== accordions.length - 1
  //             ? $(this).nextUntil("div.accordion.level-" + level + ", div.accordion.level-" + (level - 1))
  //             : $(this).nextAll();
  //         elementsToWrap.wrapAll("<div class='panel'></div>");
  //     });
  // }

  function wrapContentInPanels() {
    for (var i = 1; i < toggableHeadersList.length; i++) {
      var level = i + 1;
      var accordions = $("div.accordion.level-" + level);
      accordions.each(function (index) {
        var elementsToWrap;
        if (index !== accordions.length - 1) {
          elementsToWrap = $(this).nextUntil("div.accordion.level-" + level);
        } else {
          elementsToWrap = $(this).nextAll();
        }
        elementsToWrap.wrapAll("<div class='panel level-" + level + "'></div>");
      });
    }
  }

  wrapContentInPanels();
}

function toggleHeading(header) {
  $(header).toggleClass("active");
  $(header).next().toggleClass("show");
  $(header)
    .next()
    .slideToggle((duration = 340));
}

function showHeading(header, animate = false, animationDuration = 340) {
  $(header).addClass("active");
  $(header).next().addClass("show");
  if (animate) {
    $(header)
      .next()
      .slideDown((duration = animationDuration));
  } else {
    // This simply displays the heading without animating it, used for the back cloze to avoid the animation making it look like it closes and reopens
    $(header).next().css("display", "block");
  }
}

function hideHeading(header, animate = false, animationDuration = 340) {
  $(header).removeClass("active");
  $(header).next().removeClass("show");
  if (animate) {
    $(header)
      .next()
      .slideUp((duration = animationDuration));
  } else $(header).next().css("display", "none");
}
