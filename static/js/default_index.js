function extend(a, b) {
    for (var i = 0; i < b.length; i++) {
        a.push(b[i]);
    }
};

// Enumerates an array.
var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    var app = new Vue({
        el: "#app",
        data: {
            on_main_page: true,
            on_post_pet_page: false,
            on_pet_page: false,
            main: {
                pet_list: [],
                pet_list_length: 0,
                pet_grid_rows: 0,
                show_feed: false
            },
            post_pet: {
                pet_title: "",
                pet_description: "",
                pet_type: "",
                pet_price: "",
                image_url: "",
                image_file: null,
                pet_owner_phone_number: ""
            },
            pet: {
                pet_idx: null
            }
        },
        methods: {
            
            // navigation

            main_page: main_page,
            post_pet_page: post_pet_page,
            pet_page: pet_page,


            // post pet page

            onFileChange(e){
                const file = e.target.files[0];
                app.post_pet.image_url = URL.createObjectURL(file);
                console.log(app.post_pet.image_url + "🤷‍♀️");
            },
            change_image_url: change_image_url,
            submit_button_clicked: submit_button_clicked,
            cancel_button_clicked: cancel_button_clicked,

            // pet page
            back_button_clicked: back_button_clicked,
        }
    });



    // MARK: Navigation

    function main_page() {
        get_pets();
        app.on_main_page = true;
        app.on_post_pet_page = false;
        app.on_pet_page = false;
    }

    function post_pet_page() {
        app.on_main_page = false;
        app.on_post_pet_page = true;
        app.on_pet_page = false;
    }

    function pet_page(pet_idx) {
        app.on_main_page = false;
        app.on_post_pet_page = false;
        app.on_pet_page = true;
        app.pet.pet_idx = pet_idx;

        get_pet_data(app.pet.pet_idx);
    }


    // MARK: Main page


    function get_pets() {
        $.getJSON(get_pet_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                app.main.pet_list = data.pet_list;
                // this.pet_list = data.pet_list;
                // Post-processing.
                process_pets();
                //console.log(main.show_feed);
            }
        );
        console.log("I fired the get");
    }

    function process_pets() {
        enumerate(app.main.pet_list);

        app.main.pet_list_length = app.main.pet_list.length;

        app.main.pet_grid_rows = Math.ceil(app.main.pet_list_length / 3);
        console.log(app.main.pet_grid_rows + "😃");

        app.main.pet_list.map(function (e) {
            Vue.set(e, 'pet_image_url', e.pet_image_url);
            Vue.set(e, 'pet_title', e.pet_title);
            Vue.set(e, 'pet_date', e.pet_date);
            Vue.set(e, 'pet_price', e.pet_price);
        });

        app.main.show_feed = true;
    }

    
    // MAR: Post pet page


    function submit_button_clicked() {
        console.log("submit button clicked on post pet screen");
        console.log(app.post_pet.pet_title);
        console.log(app.post_pet.pet_description);
        console.log(app.post_pet.pet_type);
        console.log(app.post_pet.image_url);

        upload_file();

        $.post(add_pet_url, {
            pet_title: app.post_pet.pet_title,
            pet_description: app.post_pet.pet_description,
            pet_type: app.post_pet.pet_type,
            pet_owner_phone_number: app.post_pet.pet_owner_phone_number,
            pet_image_url: app.post_pet.image_url ,
            pet_price: app.post_pet.pet_price
        }, function() {
            main_page();
        });

        clear_form_data();
    }

    function cancel_button_clicked() {
        clear_form_data();
        main_page();
    }

    function upload_file() {
        // This function is in charge of: 
        // - Creating an image preview
        // - Uploading the image to GCS
        // - Calling another function to notify the server of the final image URL.

        // Reads the file.
        var file = app.post_pet.image_file;
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
                    req.addEventListener("load", upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    }

    function upload_complete(get_url) {
        console.log('The file was uploaded; it is now available at ' + get_url);
        app.post_pet.image_url = get_url;
    }

    function change_image_url(event) {
        var input = event.target;
        var file = input.files[0];

        app.post_pet.image_file = file;
    }


    // MARK: Pet page
    function get_pet_data(pet_idx) {
        if (pet_idx != null) {
            console.log("💩" + pet_idx);
        }
    }

    function back_button_clicked() {
        main_page();
    }




    // MARK: Helpers


    function clear_form_data(){
        app.post_pet.pet_title = "";
        app.post_pet.pet_description = "";
        app.post_pet.pet_type = "";
        app.post_pet.pet_price = "";
        app.post_pet.image_url = null;
        app.post_pet.image_file = "";
        app.post_pet.pet_owner_phone_number = "";
    }










    get_pets();







