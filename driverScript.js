// right collapse button
$('#right-bar-collapse-btn').click(function() {
    $('.right-bar').toggleClass('bar-collapsed');
    updateLayout();
});

// bottom collapse button
$('#bottom-bar-collapse-btn').click(function() {
    $('.bottom-bar').toggleClass('bar-collapsed');
    updateLayout();
});

$('#reset-layout-btn').click(function() {
    $(this).addClass('disabled');
    $('.left-bar, .right-bar, .bottom-bar').removeClass('bar-collapsed');
    resetLayout();
});

$('#left-bar-collapse-btn').hover(function() {
    $('.left-bar').toggleClass('collapse-opacity');
});

$('#right-bar-collapse-btn').hover(function() {
    $('.right-bar').toggleClass('collapse-opacity');
});

$('#bottom-bar-collapse-btn').hover(function() {
    $('.bottom-bar').toggleClass('collapse-opacity');
});

// reset layout function
function resetLayout() {
    $('.main-content').removeClass('main-expanded-full main-expanded-right main-expanded-bottom main-expanded-left-right');
    $('.right-bar').removeClass('right-expanded-bottom');
}

// Function to update the layout based on the current state of the bars
function updateLayout() {

    // check for enabling/disabling reset layout button
    if ($('.right-bar').hasClass('bar-collapsed') || $('.bottom-bar').hasClass('bar-collapsed')) {
        $('#reset-layout-btn').removeClass('disabled');
    } else {
        $('#reset-layout-btn').addClass('disabled');
    }

    // Reset classes
    resetLayout();

    if ($('.right-bar').hasClass('bar-collapsed')) {
        $('.main-content').addClass('main-expanded-left-right');
    }

    if ($('.bottom-bar').hasClass('bar-collapsed')) {
        $('.main-content').addClass('main-expanded-bottom');
        if (!$('.right-bar').hasClass('bar-collapsed')) {
            $('.right-bar').addClass('right-expanded-bottom');
        }
    }
}