var app = function() {

    var self = {};

    self.submitButtonClicked = function () {
    	console.log("submit button clicked on post pet screen");
    	console.log(self.vue.pet_name);
    	console.log(self.vue.pet_description);
    	console.log(self.vue.pet_type);
        console.log(self.vue.image_url);

    	$.post(add_pet_url, {
    		pet_name: self.vue.pet_name,
    		pet_description: self.vue.pet_description,
    		pet_type: self.vue.pet_type,
            pet_image_url: self.vue.image_url,
            pet_owner_phone_number: self.vue.pet_owner_phone_number
    	});
    }

    self.vue = new Vue({
    	el: "#post_pet_vue_div",
    	delimiters: ['${', '}'],
    	unsafeDelimiters: ['!{', '}'],
    	data: {
    		pet_name: "",
    		pet_description: "",
    		pet_type: "",
            image_url: "",
            pet_owner_phone_number: ""
    	},
    	methods: {
    		submitButtonClicked: self.submitButtonClicked,

            onFileChange(e){
                const file = e.target.files[0];
                this.image_url = URL.createObjectURL(file);
            }
    	}
    });

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
