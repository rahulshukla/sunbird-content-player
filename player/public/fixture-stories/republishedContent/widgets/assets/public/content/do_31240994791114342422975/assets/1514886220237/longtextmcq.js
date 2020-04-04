Plugin.extend({
    _questionText: undefined,
    _questionImage: undefined,
    _questionAudio: undefined,
    _mainDiv: undefined,
    _truncateLimitWithImage: 115,
    _truncateLimitWithoutImage: 160,
    _truncateLimit: 0,
    _type: 'longTextMCQ',
    _isContainer: false,
    _render: true,

    initPlugin: function(data) {
        var dims = this.relativeDims();
        var div = document.getElementById(data.id);
        var asset = data.asset;
        if (div) {
            jQuery("#" + data.id).remove();
        }

        this._questionText = this._stage.getModelValue(data.data).question;
        this._questionImage = this._stage.getModelValue(data.data).question_image;
        this._questionAudio = this._stage.getModelValue(data.data).question_audio;

        this._mainDiv = document.createElement('div');
        this._mainDiv.id = "mainQuestionDiv";
        this._mainDiv.style.top = dims.y + "px";
        this._mainDiv.style.left = dims.x + "px";
        this._mainDiv.style.width = dims.w + "px";
        this._mainDiv.style.height = dims.h + "px";

        this._questionImage? this._truncateLimit = this._truncateLimitWithImage : this._truncateLimit = this._truncateLimitWithoutImage;
        this._mainDiv.appendChild(this.createBaseLayout());
        this._mainDiv.appendChild(this.createQuestionLayout(data));
        this._mainDiv.appendChild(this.addAudio());

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(this._mainDiv, parentDiv.childNodes[0]);
        this._self = new createjs.DOMElement(this._mainDiv);

        if(this._questionText.length<=this._truncateLimit){
            this.hideFullImage();
        }else{
            this.showFullImage();
        }
    },

    createBaseLayout: function() {
        var self = this;
        var qImage = Renderer.theme._data.manifest.media.find(function(o) {
            return o.id == self._questionImage });
        var image = undefined;

        if (qImage) {
            image = document.createElement("IMG");
            image.setAttribute("src", qImage.src);
        }

        var question = "";
        var questionBg = document.createElement("DIV");
        questionBg.setAttribute("id", "question_small");
        questionBg.setAttribute("class", "question_bg");
        questionBg.addEventListener("click", this.showFullImage);

        var questionText = document.createElement("DIV");
        var displayText = self._questionText;

        if(self._questionText.length>self._truncateLimit){
            displayText = self._questionText.substring(0, self._truncateLimit)+"...";
        }
        questionText.appendChild(document.createTextNode(displayText));
        questionText.setAttribute("class", "question_text");

        if (this._questionText != "" && image) {
            image.setAttribute("class", "question_image");
            questionBg.appendChild(image);
            questionBg.appendChild(questionText);
            question = questionBg;
        } else if (image) {
            image.setAttribute("class", "question_image_center");
            questionBg.appendChild(image);
            question = questionBg;
        } else {
            questionBg.appendChild(questionText);
            question = questionBg;
        }
        return question;
    },
    createQuestionLayout: function(data) {
        var self = this;
        var qImage = Renderer.theme._data.manifest.media.find(function(o) {
            return o.id == self._questionImage });
        var image = undefined;

        var fullView = document.createElement("div");
        fullView.setAttribute("id", "question_full");
        fullView.setAttribute("class", "question_full");
        var fullHeight = self._mainDiv.style.height.split("px")[0] * (96/data.h); // 96 being the height of grey bg
        fullView.setAttribute("style","height: "+fullHeight+"px");
        fullView.addEventListener("click", this.hideFullImage);

        var lowerDiv = document.createElement("div");
        lowerDiv.setAttribute("id", "question_text_full");
        lowerDiv.appendChild(document.createTextNode(this._questionText));
        lowerDiv.setAttribute("class", "question_text_full");

        var button = document.createElement('BUTTON');
        button.setAttribute("class", "answer_button");
        button.appendChild(document.createTextNode("Answer"));

        fullView.appendChild(button);
        fullView.appendChild(lowerDiv);

        if (qImage) {
            image = document.createElement("IMG");
            image.setAttribute("id", "fullImage");
            image.setAttribute("src", qImage.src);
            image.setAttribute("alt", "No image available");
            image.setAttribute("class", "question_image_full");
            image.addEventListener("click", this.hideFullImage);

            fullView.appendChild(image);
        }else{
            lowerDiv.setAttribute("style","flex-grow:1");
        }
        return fullView;
    },
    addAudio: function() {
        var audioPath = Renderer.theme._data.manifest.media[1].src;
        var audio = document.createElement("AUDIO");
        audio.setAttribute("id", "qaudio");
        audio.setAttribute("src", audioPath);
        return audio;
    },
    showFullImage: function() {
        var smallView = document.getElementById('question_small');
        smallView.style.display = "none";
        var div = document.getElementById("question_full");
        div.style.display = "flex";
        document.getElementById("qaudio").play();

    },
    hideFullImage: function() {
        var smallView = document.getElementById('question_small');
        smallView.style.display = "flex";
        var div = document.getElementById("question_full");
        div.style.display = "none";
        document.getElementById("qaudio").pause();
        document.getElementById("qaudio").currentTime = 0;
    }

});
//#Sourceurl = ckadv.js
