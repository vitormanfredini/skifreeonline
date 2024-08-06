function ski(width,height){
    
    this.loadCount = 0;
    this.arrImagesToLoad = [
        
        'images/ilha.png',
        'images/monster.gif',
        //'images/penhasco.gif',
        'images/placa.png',
        'images/icons.png',
        'images/mergulho.gif',
        'images/penhasco.png',
        
        'images/homem/homem_caido.png',
        'images/homem/homem_direita3.png',
        'images/homem/homem_esquerda3.png',
        'images/homem/homem_sentado.png',
        'images/homem/homem_direita1.png',
        'images/homem/homem_esquerda1.png',
        'images/homem/homem_pulando.png',
        'images/homem/homem_direita2.png',
        'images/homem/homem_esquerda2.png',
        'images/homem/homem_reto.png',
        
        'images/objetos/arvore_cheia.png',
        'images/objetos/ondinha.png',
        'images/objetos/pedra2.png',
        'images/objetos/teleferico_gente.png',
        'images/objetos/arvore_maior.png',
        'images/objetos/ondonas.png',
        'images/objetos/poste_teleferico.png',
        'images/objetos/teleferico_vazio.png',
        'images/objetos/arvore_pelada.png',
        'images/objetos/pedra1.png',
        'images/objetos/rampa_GLBT.png',
        
        'images/objetos/copyright.png',
        'images/objetos/placas1.png',
        'images/objetos/placas2.png'
        
    ];
    
    this.playing = true;
    
    this.gamecanvas;
    this.state = 'loading';
    this.arrObjects = new Array();
    
    this.velocidadeMaxima = 0.425;
    this.aceleracao = 0.005;
    this.velocidade = 0;
    this.distancia = 0;
    
    this.skier;
    this.skierPosicao = 2; //-4, -3, -2, -1, 0, 1, 2, 3, 4, 5. (oeste2, leste2, oeste, sudoeste, sul, sudeste, leste, caido, sentado, pulando)
    this.pulando = false;
    this.distanciaHor = 0;
    this.puloDeLadoDistancia = 8;
    
    this.distanciaAcabaObjetos = 6000;//8000;
    this.distanciaAcabaGelo = this.distanciaAcabaObjetos + 800;
    this.chegouAoFim = false;
    this.tamanhoDaQueda = 370;
    
    correcaoQuantoEstaDeLadoAnterior = 0;
    correcaoQuantoEstaDeLado = 0;
    
    this.framerate = 1000 / 60;
        
    this.lastTimestamp;
    this.currentTimestamp;
    this.deltaTime;
    
    this.correcaoTopReferencia;
    this.correcaoLeftReferencia;
    this.viewport = { width : 0, height : 0 };
    
    this.blocosObjetosAdicionados = 0;
    this.tamanhosDosBlocosDeObjetos = 500;
    
}

ski.prototype.load = function(){
    
    for(var c=0; c<this.arrImagesToLoad.length; c++){
        this.loadImage(this.arrImagesToLoad[c]);
    }
    
}

ski.prototype.isLoaded = function(){
    if(this.loadCount === this.arrImagesToLoad.length){
        return true;
    }
    return false;
}

ski.prototype.loadImage = function(url){
    var newImg = new Image;
    newImg.onload = function() {
        objSki.addLoadCount();
    }
    newImg.src = url;
}

ski.prototype.addLoadCount = function(){
    this.loadCount++;
}

ski.prototype.update = function(){
    
    if(this.playing == false) return false;
    
    //atualiza os timestamps e deltatime
    this.lastTimestamp = this.currentTimestamp;
    this.currentTimestamp = new Date().getTime();
    this.deltaTime = this.currentTimestamp - this.lastTimestamp;
    
    //ja caiu na agua?
    if(this.getDistancia() < this.distanciaAcabaGelo - this.getCorrecaoTopReferencia() - 252 + this.tamanhoDaQueda){
        //atualiza aceleracao
        if($.inArray(this.skierPosicao,[-4,-3,-1,0,1]) !== -1){
            if(this.velocidade < this.velocidadeMaxima){
                this.velocidade += this.aceleracao;
                if(this.velocidade > this.velocidadeMaxima) this.velocidade = this.velocidadeMaxima;
            }
        }else if($.inArray(this.skierPosicao,[5]) !== -1){
            //
        }else{
            this.velocidade = 0;
        }
    }else{
        //para de descer
        this.velocidade = 0;
        //poe agua borbulhando
        leftAguinha = parseInt($("#"+this.skier).css('left')) - 52;
        bottomAguinha = parseInt($("#"+this.skier).css('bottom')) - 57;
        $(this.gamecanvas).append('<div class="aguinha" style="left:'+leftAguinha+'px;bottom:'+bottomAguinha+'px;"></div>');
        //esconde skier
        $("#"+this.skier).hide();
        //para de atualizar os frames do jogo
        this.playing = false;
        //mostra tela final
        this.telaFinal();
        //some com controler no mobile
        $(".mobile-controls-wrapper").hide();
    }
    
    //
    if(this.getDistancia() > this.getDistanciaAcabaObjetos() - this.getCorrecaoTopReferencia() + 10){
        if(this.getChegouAoFim() == false){
            this.setChegouAoFim(true);
            this.setSkierPosicao(0);
            //adiciona o gelo final
            this.adicionaGeloFinal();
        }
    }
    
    if(this.getDistancia() > this.distanciaAcabaGelo - this.getCorrecaoTopReferencia() - 252){
        this.setSkierPosicao(5);
        
        //faz animacao
        $("#"+this.skier).animate({
            marginBottom:-30
        },1000);
        
    }
    
    //atualiza os objetos na tela
    this.updateObjects();

    //para testar tela final, descomente:
    // this.telaFinal();
    // this.setChegouAoFim(true);
    // this.velocidade = 0;
    // this.playing = false;
    
}

ski.prototype.adicionaGeloFinal = function(){
    $(this.gamecanvas).prepend('<div class="gelofinal" style="left:'+this.distanciaHor+'px;bottom:-'+this.distanciaAcabaGelo+'px;"><div class="agua"><div class="monstroafogando"></div></div></div>');
}

ski.prototype.updateObjects = function(){
    //calcula distancia
    distanciaAndar = this.velocidade * this.deltaTime;
    
    if(this.getSkierPosicao() == -1){
        distanciaAndar = distanciaAndar * 0.8;
    }else if(this.getSkierPosicao() == 1){
        distanciaAndar = distanciaAndar * 0.8;
    }else if(this.getSkierPosicao() == -4){
        distanciaAndar = distanciaAndar * 0.5;
    }else if(this.getSkierPosicao() == -3){
        distanciaAndar = distanciaAndar * 0.5;
    }else{
        distanciaAndar = distanciaAndar;
    }
    
    this.distancia += distanciaAndar;
        
    //aplica distancia em tudo
    $(this.gamecanvas).css('top',(this.distancia * -1));
    
    //corrige objetos
    this.corrigeObjects(distanciaAndar);

}

ski.prototype.corrigeObjects = function(distanciaAndar){
    
    leftFrom = this.distanciaHor;
    
    if(this.getSkierPosicao() == -1){
        this.distanciaHor -= distanciaAndar * 0.5;
        $("#"+this.skier).css('left',this.distanciaHor);
    }else if(this.getSkierPosicao() == 1){
        this.distanciaHor += distanciaAndar * 0.5;
        $("#"+this.skier).css('left',this.distanciaHor);
    }else if(this.getSkierPosicao() == -4){
        this.distanciaHor -= distanciaAndar * 1.8;
        $("#"+this.skier).css('left',this.distanciaHor);
    }else if(this.getSkierPosicao() == -3){
        this.distanciaHor += distanciaAndar * 1.8;
        $("#"+this.skier).css('left',this.distanciaHor);
    }else{
        $("#"+this.skier).css('left',this.distanciaHor);
    }
    
    leftTo = this.distanciaHor;
    
    //pega css bottom do skier
    bottomSkierAnterior = parseFloat($("#"+this.skier).css('bottom'));
    //css bottom que o skier vai
    bottomSkier = parseFloat((this.correcaoTopReferencia * -1) + (this.distancia * -1));
    
    //corrige o esquiador (para mante-lo no meio)
    $("#"+this.skier).css('bottom',bottomSkier);
    
    //corrige canvas (para não deixar o esquiador sair da tela)
    leftCanvas = (this.correcaoLeftReferencia * 1) + (this.distanciaHor * -1);
    $(this.gamecanvas).css('left',leftCanvas);
    
    //só trata colisao em certas posicoes do skier
    if(this.getSkierPosicao() == -1 || this.getSkierPosicao() == 0 || this.getSkierPosicao() == 1 || this.getSkierPosicao() == -3 || this.getSkierPosicao() == -4){
        colisaoTipo = this.isColliding(bottomSkierAnterior,bottomSkier,leftFrom,leftTo);
        //se for colisao de batida
        if(colisaoTipo == 1){
            this.caiu();
        }else
        //se for colisao de rampa
        if(colisaoTipo == 2){
            this.pulo(1);
        }
        //se for colisao de neve pequena
        if(colisaoTipo == 3){
            this.pulo(2);
        }
    }
}

ski.prototype.setGamecanvas = function(element){
    this.gamecanvas = element;
}

ski.prototype.isColliding = function(bottomFrom,bottomTo,leftFrom,leftTo){
    
    //se está pulando não colide com nada
    if(this.getPulando() == true){
        return 0;
    }    
    
    larguraSkier = 34;
    mediaLeftSkier = ((leftFrom + leftTo) / 2) + larguraSkier/2;
    
    for(c=0;c<this.arrObjects.length;c++){
        //bottomObj = parseFloat($('#'+this.arrObjects[c].id).css('bottom'));
        bottomObj = this.arrObjects[c].bottom;
        if(bottomObj < bottomFrom && bottomObj > bottomTo){
            //leftObj = parseFloat($('#'+this.arrObjects[c].id).css('left'));
            leftObj = this.arrObjects[c].left;
            //left2Obj = leftObj + parseFloat($('#'+this.arrObjects[c].id).css('width'));
            left2Obj = leftObj + this.arrObjects[c].width;
            if(mediaLeftSkier + (larguraSkier/2) > leftObj && mediaLeftSkier - (larguraSkier/2) < left2Obj){
                if($.inArray(this.arrObjects[c].type,['rock','tree','rock2','tree2','tree3']) !== -1){
                    return 1;
                }else if($.inArray(this.arrObjects[c].type,['ramp']) !== -1){
                    return 2;
                }else if($.inArray(this.arrObjects[c].type,['snow']) !== -1){
                    return 3;
                }else{
                    return 4;
                }
                
            }
        }
    }
    
    return 0;
}

ski.prototype.setSection = function(newState){
    if(
        newState == 'loading' ||
        newState == 'playing' ||
        newState == 'pause' ||
        newState == 'theend'
    ){
        this.state = newState;
        return true;
    }
    return false;
}

ski.prototype.getSection = function(){
    return this.state;
}

ski.prototype.handleResize = function(width,height){
    this.viewport.width = width;
    this.viewport.height = height;
    
    this.correcaoTopReferencia = height / 2;
    this.correcaoLeftReferencia = width / 2;
    
    //corrige objetos (para mante-los no meio)
    for(c=0;c<this.arrObjects.length;c++){
        //$('#'+this.arrObjects[c].id).css('bottom',this.arrObjects[c].y - this.correcaoTopReferencia);
        //this.arrObjects[c].bottom = this.arrObjects[c].y - this.correcaoTopReferencia;
    }
}

ski.prototype.getCorrecaoTopReferencia = function(){
    return this.correcaoTopReferencia;
}

ski.prototype.addObjeto = function(objProperties){
    
    objDefaultProperties = {
        type : 'tree',
        x : 0,
        y : 0,
        width : 20,
        height : 20
    };
    
    if(typeof objProperties === 'object'){
        if(typeof objProperties.type === 'undefined'){
            objProperties.type = objDefaultProperties.type;
        }
        if(typeof objProperties.x === 'undefined'){
            objProperties.x = objDefaultProperties.x;
        }
        if(typeof objProperties.y === 'undefined'){
            objProperties.y = objDefaultProperties.y;
        }
    }
    
    if(objProperties.type == 'tree'){
        objProperties.width = 28;
        objProperties.height = 32;
    }
    if(objProperties.type == 'tree2'){
        objProperties.width = 22;
        objProperties.height = 27;
    }
    if(objProperties.type == 'tree3'){
        objProperties.width = 32;
        objProperties.height = 64;
    }
    
    if(objProperties.type == 'rock'){
        objProperties.width = 23;
        objProperties.height = 11;
    }
    if(objProperties.type == 'rock2'){
        objProperties.width = 16;
        objProperties.height = 11;
    }
    
    if(objProperties.type == 'snow'){
        objProperties.width = 24;
        objProperties.height = 8;
    }
    
    if(objProperties.type == 'snow2'){
        objProperties.width = 64;
        objProperties.height = 32;
    }
    
    if(objProperties.type == 'ramp'){
        objProperties.width = 32;
        objProperties.height = 7;
    }
    
    if(objProperties.type == 'copyright'){
        objProperties.width = 92;
        objProperties.height = 72;
    }
    if(objProperties.type == 'placas1'){
        objProperties.width = 92;
        objProperties.height = 66;
    }
    if(objProperties.type == 'placas2'){
        objProperties.width = 392;
        objProperties.height = 36;
    }
    
    //guarda id deste objeto
    objProperties.id = this.arrObjects.length;
        
    //calcula left a partir do X
    styleLeft = objProperties.x - (objProperties.width / 2);
    //calcula bottom a partir do Y
    styleBottom = objProperties.y;
    objProperties.bottom = objProperties.y;
    objProperties.left = styleLeft;
    
    //coloca objeto no array de objetos
    this.arrObjects.push(objProperties);
    
    //coloca elemento no jogo
    $(this.gamecanvas).append('<div style="width:'+objProperties.width+'px;height:'+objProperties.height+'px;left:'+styleLeft+'px;bottom:'+styleBottom+'px;" id="'+objProperties.id+'" class="gameobject type-'+objProperties.type+'"></div>');
    
}

ski.prototype.addSkier = function(element){
    
    this.skier = element;
    
    //coloca personagem no jogo
    $(this.gamecanvas).append('<div id="'+this.skier+'"></div>');
    
}

ski.prototype.getSkierPosicao = function(){
    return this.skierPosicao;
}
ski.prototype.setSkierPosicao = function(novaPosicao){
    if($.inArray(novaPosicao,[-4,-3,-2,-1,0,1,2,3,4,5]) !== -1){
        this.skierPosicao = novaPosicao;
        this.updateSkierClass();
    }
}

ski.prototype.puloProLado = function(lado){
    this.distanciaHor += this.puloDeLadoDistancia * lado;
    $("#"+this.skier).css('left',this.distanciaHor);

    this.corrigeObjects(0);
}

ski.prototype.updateSkierClass = function(){
    $("#"+this.skier).removeClass('pos-4');
    $("#"+this.skier).removeClass('pos-3');
    $("#"+this.skier).removeClass('pos-2');
    $("#"+this.skier).removeClass('pos-1');
    $("#"+this.skier).removeClass('pos0');
    $("#"+this.skier).removeClass('pos1');
    $("#"+this.skier).removeClass('pos2');
    $("#"+this.skier).removeClass('pos3');
    $("#"+this.skier).removeClass('pos4');
    $("#"+this.skier).removeClass('pos5');
    
    $("#"+this.skier).addClass('pos'+this.skierPosicao);
}

ski.prototype.caiu = function(){
    this.setSkierPosicao(3);
    setTimeout(function(){
       objSki.setSkierPosicao(4); 
    },600);
}

ski.prototype.setPulando = function(boolPulando){
    this.pulando = boolPulando;
}

ski.prototype.getPulando = function(){
    return this.pulando;
}

ski.prototype.pulo = function(tipoPulo){
    this.setPulando(true);
    this.setSkierPosicao(5);
    
    if(tipoPulo == 2){
        altura = 80 * this.velocidade;
        tempo = 2000 * this.velocidade;
    }else{
        altura = 600 * this.velocidade;
        tempo = 6000 * this.velocidade;
    }
    
    metadeTempo = parseInt(tempo / 2);
    
    //faz animacao
    $("#"+this.skier).animate({
        marginBottom:altura
    },metadeTempo,"easeOutQuad",function(){
        $("#"+objSki.skier).animate({
            marginBottom:0
        }, metadeTempo,"easeInQuad");
    });
    
    //timeout pra cair
    setTimeout(function(){
        objSki.setPulando(false);
        objSki.setSkierPosicao(0);
    },tempo);
}

ski.prototype.generateObjects = function(isFirst){
    
    //daqui pra cima, removeremos os objetos
    limitBottom = parseInt($("#"+this.skier).css('bottom'));
    limitBottom += (($(window).height() / 2) + 100);
    
    //quais objetos estao pra cima?
    arrObjectsNovo = new Array();
    for(c=0;c<this.arrObjects.length;c++){
        //objBottom = parseInt($('#'+this.arrObjects[c].id).css('bottom'));
        objBottom = this.arrObjects[c].bottom;
        if(objBottom < limitBottom){
            arrObjectsNovo.push(this.arrObjects[c]);
        }else{
            $('#'+this.arrObjects[c].id).remove();
        }
    }
    this.arrObjects = arrObjectsNovo;
    
    //checa se precisa adicionar mais objetos
    objetosAMais = 2;
    distanciaAdicionada = this.blocosObjetosAdicionados * this.tamanhosDosBlocosDeObjetos;
    distanciaPrecisaAdicionar = this.distancia + (objetosAMais * this.tamanhosDosBlocosDeObjetos);
    if(distanciaAdicionada < distanciaPrecisaAdicionar){
        
        areaTotalX = 5000;
        areaTotalY = this.tamanhosDosBlocosDeObjetos;

        countObjects = 0;

        qtdPedras = 10;
        qtdPedras2 = 0;
        qtdArvores1 = 10;
        qtdArvores2 = 10;
        qtdArvores3 = 10;
        qtdNeve1 = 10;
        qtdNeve2 = 5;
        
        if(this.getDistancia() > this.getDistanciaAcabaObjetos() - this.getCorrecaoTopReferencia() - 2000){
            qtdRampa = 0;
        }else{
            qtdRampa = 10;
        }
        
        //primeiros objetos na montanha
        if(isFirst === true){
            
            refLeft = parseInt($("#"+this.skier).css('left'));
            refBottom = parseInt(-($(window).height() / 2));
                        
            objSki.addObjeto({
                x: refLeft - 200,
                y: refBottom + 100,
                type: 'copyright'
            });
            
            /*objSki.addObjeto({
                x: refLeft + 200,
                y: refBottom + 50,
                type: 'placas1'
            });*/
            
            objSki.addObjeto({
                x: refLeft - 20,
                y: refBottom - 90,
                type: 'placas2'
            });
        }
        
        //proximos objetos
        if(isFirst === false){
            while(true){

                if(countObjects < qtdPedras){
                    objStr = 'rock';
                }else if(countObjects < qtdPedras + qtdPedras2){
                    objStr = 'rock2';
                }else if(countObjects < qtdPedras + qtdPedras2 + qtdArvores1){
                    objStr = 'tree';
                }else if(countObjects < qtdPedras + qtdPedras2 + qtdArvores1 + qtdArvores2){
                    objStr = 'tree2';
                }else if(countObjects < qtdPedras + qtdPedras2 + qtdArvores1 + qtdArvores2 + qtdArvores3){
                    objStr = 'tree3';
                }else if(countObjects < qtdPedras + qtdPedras2 + qtdArvores1 + qtdArvores2 + qtdArvores3 + qtdNeve1){
                    objStr = 'snow';
                }else if(countObjects < qtdPedras + qtdPedras2 + qtdArvores1 + qtdArvores2 + qtdArvores3 + qtdNeve1 + qtdNeve2){
                    objStr = 'snow2';
                }else if(countObjects < qtdPedras + qtdPedras2 + qtdArvores1 + qtdArvores2 + qtdArvores3 + qtdNeve1 + qtdNeve2 + qtdRampa){
                    objStr = 'ramp';
                }else if(countObjects >= qtdPedras + qtdPedras2 + qtdArvores1 + qtdArvores2 + qtdArvores3 + qtdNeve1 + qtdNeve2 + qtdRampa){
                    break;
                }

                randX = Math.floor(Math.random() * areaTotalX);
                randY = Math.floor(Math.random() * areaTotalY);

                randX = randX - (areaTotalX/2);
                randY = (randY * -1);// + ($(window).height() / 2);

                randX += parseInt($("#"+this.skier).css('left'));
                randY -= distanciaAdicionada;

                if((randY*-1) < this.distanciaAcabaObjetos){
                    objSki.addObjeto({
                        x: randX,
                        y: randY,
                        type: objStr
                    });
                }

                countObjects++;
            }
        }
        this.blocosObjetosAdicionados++;
    }
    
}

ski.prototype.getDistancia = function(){
    return this.distancia;
}

ski.prototype.getDistanciaAcabaObjetos = function(){
    return this.distanciaAcabaObjetos;
}

ski.prototype.getChegouAoFim = function(){
    return this.chegouAoFim;
}

ski.prototype.setChegouAoFim = function(novoChegouAoFim){
    this.chegouAoFim = novoChegouAoFim;
}

ski.prototype.init = function(){
    //mostra o jogo
    $(this.gamecanvas).fadeIn();
    
    //inicializa os tempos
    this.lastTimestamp = new Date().getTime();
    this.currentTimestamp = new Date().getTime();
    this.deltaTime = 0;
    
    //controles de teclado
    $(document).keydown(function(e) {
        
        if(
            e.keyCode !== 40 &&
            e.keyCode !== 37 &&
            e.keyCode !== 39
        ){
            return true;
        }
        
        if(objSki.getChegouAoFim() == true){
            return false;
        }
        
        //se estiver caído, impede interação
        if(objSki.getSkierPosicao() == 3){
            return false;
        }
        
        //se está pulando impede interacao
        if(objSki.getPulando() == true){
            return false;
        }
        
        //esquerda
        if(e.keyCode == 37) {
            if(objSki.getSkierPosicao() == 2){
                objSki.setSkierPosicao(-2);
            }else if(objSki.getSkierPosicao() == 1){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == 0){
                objSki.setSkierPosicao(-1);
            }else if(objSki.getSkierPosicao() == -1){
                objSki.setSkierPosicao(-4);
            }else if(objSki.getSkierPosicao() == -4){
                objSki.setSkierPosicao(-2);
            }else if(objSki.getSkierPosicao() == -3){
                objSki.setSkierPosicao(1);
            }else if(objSki.getSkierPosicao() == -2){
                objSki.puloProLado(-1);
            }else if(objSki.getSkierPosicao() == 4){
                objSki.setSkierPosicao(-2);
            }
        }
        //baixo
        if(e.keyCode == 40) {
            if(objSki.getSkierPosicao() == -2){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == -1){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == 1){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == 2){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == 4){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == -3){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == -4){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == 4){
                objSki.setSkierPosicao(0);
            }
        }
        //direita
        if(e.keyCode == 39) {
            if(objSki.getSkierPosicao() == -2){
                objSki.setSkierPosicao(2);
            }else if(objSki.getSkierPosicao() == -1){
                objSki.setSkierPosicao(0);
            }else if(objSki.getSkierPosicao() == 0){
                objSki.setSkierPosicao(1);
            }else if(objSki.getSkierPosicao() == 1){
                objSki.setSkierPosicao(-3);
            }else if(objSki.getSkierPosicao() == -3){
                objSki.setSkierPosicao(2);
            }else if(objSki.getSkierPosicao() == -4){
                objSki.setSkierPosicao(-1);
            }else if(objSki.getSkierPosicao() == 2){
                objSki.puloProLado(1);
            }else if(objSki.getSkierPosicao() == 4){
                objSki.setSkierPosicao(2);
            }
        }
        
    });
    
    objSki.updateSkierClass();
    
    //loop que atualiza objetos na tela
    setInterval(function(){
        objSki.update();
    },this.framerate);
    
    objSki.generateObjects(true);
    objSki.generateObjects(false);
    objSki.generateObjects(false);
    objSki.generateObjects(false);
    
    //loop que adiciona e remove objetos de acordo com a posicao do skier
    setInterval(function(){
        objSki.generateObjects(false);
    },500);
    
}

ski.prototype.telaFinal = function(){
    setTimeout(function(){
        //$(".telafinal").fadeIn(1000);
        
        $(".telafinalpretaporqueojesuspediu").show();
        setTimeout(function(){
            $(".telafinal").show();
            $(".nevinhadojesus").show();
            $(".telafinalpretaporqueojesuspediu").hide();
            $('.nevinhadojesus').snowfall({collection : '', flakeCount : 250});
        },1000);
        
        setTimeout(function(){
            $(".telafinal .placa").animate({
                top:0
            },1000);
        },2000);
        setTimeout(function(){
           $(".telafinal .faixainferior").animate({
                bottom:0
            },1000);
        },3000);
    },2000);
}
