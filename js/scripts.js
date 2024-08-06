var objSki;
var intervalLoading;

function isMobile(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true;
    }
    return false;
}

$(document).ready(function(){
    
    // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    //     htmlError = '<p class="errormobile">Sorry,<br />SkiFree<br />only works<br />in your computer.</p>';
    //     $("body").html(htmlError);
    //     return false;
    // }
    
    objSki = new ski(
        $(window).width(),
        $(window).height()
    );
    
    objSki.setGamecanvas("#pontodereferencia");
    objSki.addSkier("skier");
    
    objSki.handleResize($(window).width(),$(window).height());
    
    objSki.load();
    
    intervalLoading = setInterval(function(){
        if(objSki.isLoaded()){
            clearInterval(intervalLoading);
            objSki.init();
            if(isMobile()){
                $(".mobile-controls-wrapper").fadeIn();
            }
        }
    }, 300);
    
    $("#abretexto").click(function(){
        $(".telafinal .dicas").slideDown();
        $('html,body').animate({
            scrollTop: $(".telafinal .faixainferior:eq(0)").offset().top
        }, 1000);
        
        return false;
    });
    
    //links de share
    $(".spread .facebook").click(function(){
        popup("https://www.facebook.com/sharer.php?u=https://skifreeonline.com",700,600);
        return false;
    });
    $(".spread .twitter").click(function(){
        popup("https://twitter.com/share?text=Remember%20the%20classic%20game%20SkiFree%3F%20It%27s%20your%20chance%20to%20play%20it%20one%20more%20time.&url=https://skifreeonline.com",700,600);
        return false;
    });

    //mobile controls
    $("#mobile-controls a").click(function(e){
        //cancela comportamento padrão do clique
        e.preventDefault();

        triggerKey($(this).data("direction"));
    });
    
});

$(window).resize(function() {
    //objSki.handleResize($(window).width(),$(window).height());
});

function popup(url, width, height){
    window.open(url,"_blank","toolbar=no, scrollbars=no, resizable=no, top=500, left=500, width="+width+", height="+height+"");
}

function triggerKey(whatKey){
    //console.log(whatKey);
    var e = $.Event('keydown');
    if(whatKey == "left"){
        e.which = 37;
        e.keyCode = 37;
    }else if(whatKey == "down"){
        e.which = 40;
        e.keyCode = 40;
    }else if(whatKey == "right"){
        e.which = 39;
        e.keyCode = 39;
    }else{
        return false;
    }
    $(document).trigger(e);
}

//se mudar de orientação, recarrega a página
screen.orientation.addEventListener("change", function(e) {
    window.location.reload();
});
