class StepByStep {
  constructor(form) {
    this.current_step = 0;
    this.lastLoaded = "error"; 
    this.last_step = 0; 
    this.form = form;
    this.formRendered = 0;
    this.quizMarks = [];
  }
  addView() {
    if (this.form) {
      if ($$("cookingStep")) {
        var i = 0;
        if (!this.formRendered) {
          this.form.forEach(element => {
            if (!$$(element.id)) {
              $$("cookingStep").addView(element,++i);          
            } else {
              $$(element.id).show();
            }
          });
        }
       
        this.formRendered = 1;
      }
    }
  }
  
  getThis() {
    return this;
  }
  isSelectedItem() {
    if (parseInt(webix.item_id)){
      this.item_id = webix.item_id;
      return this.item_id;
    }
    this.item_id = 0;
    return 0;
  }
  nonSelectedItem(text, cb) {
    webix.alert({
      title:"Warning",
      ok:"Ok",
      text:text,
      type:"alert-warning"
    }).then(function(result){
      if (cb) cb();
      return;
    }); 
  }
  selectedItem(url) {
    var obj = this.getThis();
    webix.ajax().get(url).then(function(data){
      const jd = data.json();
      if (obj.item_id != obj.lastLoaded) {
        obj.lastLoaded = obj.item_id;
        obj.last_step = jd.last_step || 0;
        obj.steps = jd.steps || [];                    
      }
      obj.setData(jd);
    });
  }
  setData(jd) {
    if (this.current_step == this.last_step-1 || this.current_step == 0) {
      $$('equipment_back_step_btn').hide();
    } else {
      $$('equipment_back_menu_btn').hide();
      $$('equipment_back_step_btn').show();
    }
    if (jd.name) {
      $$('cooking_header').setValues(jd);                
    }
    let string_step = this.current_step+1;
    
    if (webix.prev_item == "/quiz") {
      $$('cooking_dish_step').define('template', 'Question '+string_step);
      $$('cooking_dish_value').define('template', this.steps[this.current_step].question);
      $$('cooking_dish_value').refresh();
      $$("quiz_list").parse(this.steps[this.current_step].answers);
    } else {
      $$('cooking_dish_step').define('template', 'Step '+string_step);
      if (this.steps[this.current_step].value) {
        $$('cooking_dish_value').define('template', this.steps[this.current_step].value);
        $$('cooking_dish_value').refresh();
      }
    }
    $$('cooking_dish_step').refresh();       

    this.video = $$("video").getVideo();
    this.video.setAttribute("autoplay", "1"); 
    this.video.src = this.steps[this.current_step].video;
  }
  setQuizMarks(value) {
    this.quizMarks.push(value);
    return this.quizMarks;
  }
  getQuizResult() {
    var reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
    var result = this.quizMarks.reduce(reducer);
    console.log("res",result);
    console.log("this.quizMarks",this.quizMarks);
    console.log("this.quizMarks.length",this.quizMarks.length);
    return result / this.quizMarks.length * 100;
  }
}
