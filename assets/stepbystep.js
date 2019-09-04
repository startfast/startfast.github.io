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
    
    if (webix.prev_item == "/equipment") {
      $$('cooking_dish_step').define('template', 'Question '+string_step);
      $$('cooking_dish_value').define('template', this.steps[this.current_step].question);
      $$('cooking_dish_value').refresh(); 
      const answers = this.steps[this.current_step].answers;
      let j = 0;
			answers.forEach(element => {
						
				if ($$("answerView"+j)) {
					$$('quiz_list').removeView("answerView"+j);
				}
				$$('quiz_list').addView({ id: "answerView"+j,
					cols: [{
							template: element.answer, autoheight: true, borderless: true,
						},
						{
							width: 30
						},
						{
							view: "switch", name: "answer" + j, uncheckValue:"off", checkValue: parseInt(element.cost) ? element.cost : "on", id:"answer" + j, required: true, value: 0, width: 70, padding: 0, on:{
                onChange:function(newv,oldv) {
                  const values = $$("quiz_list").getValues();
                  for (let index in values) {
                    if (index != this.config.name) {
                      $$(index).setValue("off");                      
										}
										this.setValue(newv);
                  }
                }
              }
						}
					]
				}, j++);
			});
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
    this.video.play();
  }
  setQuizAnswer(cost, answer) {
    this.quizMarks.push({"question": this.current_step, "answer":answer, "cost":cost});
    return this.quizMarks;
	}
  getQuizResult() {
		const obj = this.getThis();
		let check = 0;
		$$("quiz_list").hide();
		$$("cooking_dish_step").hide();
		$$("cooking_dish_value").hide();
		$$("quiz_list_result").show();
		$$("cooking_header").setValues({ name:"congratulations"});
		while (check < this.last_step) {
			try {
				$$('quiz_list_result').addView({ 
					id: "questionView"+check,
					cols: [
					{ view:"template", autoheight: true, borderless: true, width: 35,template:function(){            
            const answered = obj.quizMarks[check].answer.toString().replace("answer", "");
            const answer = obj.steps[check].answers[answered].cost;
						if (answer != 0 && answer != "off" && answer != "on") {
              // good
							return "<img src='/assets/images/right.png' width='17'>";
            }
            // bad
						return "<img src='/assets/images/wrong.png' width='17'>";
						} 
					},{
						view:"template", template: obj.steps[check].question, autoheight: true, borderless: true,
					}]
				}, check);
				check++;
			} catch (error) {
				console.log(obj.steps);
				console.log(check);
				console.log(obj.steps[check].answers);	
			}
		}
		var resultSum = 0;
		obj.quizMarks.forEach(element => {
			if (parseInt(element.cost)) {
				resultSum += parseInt(element.cost);
			}
    });	
    var month_dataset = [
      { name:"right", amount: resultSum, color: "#57b447" },
      { name:"wrong", amount: (obj.quizMarks.length - resultSum), color: "#CC0000" }
    ];	
    $$('quiz_list_result').addView({
      template: "<center>Your result is <strong>"+(resultSum/obj.quizMarks.length * 100)+"%</strong></center>",
      height: 15,    
      padding:{
        top: 10          
      }  
    }, check++);
		$$('quiz_list_result').addView({ 
        view: "chart",
        type:"pie",
        minWidth: 250,
        minHeight: 250,
        maxWidth: 500,
        maxHeight: 500,
        value:"#amount#",
        color:"#color#",
        //label:"#name#",
        //pieInnerText:"#amount#",
        shadow:1,
        data:month_dataset,
        padding:{
          top: 10          
        }
		//	template: "ur result is "+(resultSum/obj.quizMarks.length * 100)+"% of 100"
		}, check++);
  }
}
