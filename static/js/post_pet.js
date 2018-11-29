var app = function() {

    var self = {};

    self.submitButtonClicked = function () {
    	console.log("submit button clicked on post pet screen");
    	console.log(self.vue.pet_title);
    	console.log(self.vue.pet_description);
    	console.log(self.vue.pet_type);
        console.log(self.vue.image_url);

        self.upload_file();

    	$.post(add_pet_url, {
    		pet_title: self.vue.pet_title,
    		pet_description: self.vue.pet_description,
    		pet_type: self.vue.pet_type,
            pet_owner_phone_number: self.vue.pet_owner_phone_number,
            pet_image_url: self.vue.image_get_url ,
            pet_price: self.vue.pet_price
    	});

    }

    self.upload_file = function () {
        // This function is in charge of: 
        // - Creating an image preview
        // - Uploading the image to GCS
        // - Calling another function to notify the server of the final image URL.

        // Reads the file.
        var file = self.vue.image_file;
        if (file) {
            // We want to read the image file, and transform it into a data URL.
            var reader = new FileReader();
            // We add a listener for the load event of the file reader.
            // The listener is called when loading terminates.
            // Once loading (the reader.readAsDataURL) terminates, we have
            // the data URL available. 
            // reader.addEventListener("load", function () {
            //     // An image can be represented as a data URL.
            //     // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
            //     // Here, we set the data URL of the image contained in the file to an image in the
            //     // HTML, causing the display of the file image.
            // }, false);
            // // Reads the file as a data URL. This triggers above event handler. 
            // reader.readAsDataURL(file);

            // Now we should take care of the upload.
            // Gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    // The PUT url is used to upload the image.
                    // The GET url is used to notify the server where the image has been uploaded;
                    // that is, the GET url is the location where the image will be accessible 
                    // after the upload.  We pass the GET url to the upload_complete function (below)
                    // to notify the server. 
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    // We listen to the load event = the file is uploaded, and we call upload_complete.
                    // That function will notify the server of the location of the image. 
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };


    self.upload_complete = function(get_url) {
        console.log('The file was uploaded; it is now available at ' + get_url);
        self.vue.image_get_url = get_url;
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
    };

    self.change_image_url = function(event) {
        var input = event.target;
        var file = input.files[0];

        self.vue.image_file = file;

        console.log(self.vue.image_file);
    }

    self.vue = new Vue({
    	el: "#post_pet_vue_div",
    	delimiters: ['${', '}'],
    	unsafeDelimiters: ['!{', '}'],
    	data: {
    		pet_title: "",
    		pet_description: "",
    		pet_type: "",
            pet_price: "",
            image_url: "",
            image_file: null,
            image_get_url: null,
            pet_owner_phone_number: ""
    	},
    	methods: {
    		submitButtonClicked: self.submitButtonClicked,
            upload_file: self.upload_file,
            change_image_url: self.change_image_url,

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
