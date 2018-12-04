function extend(a, b) {
    for (var i = 0; i < b.length; i++) {
        a.push(b[i]);
    }
};

// Enumerates an array.
var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

var default_image_url = "https://i.pinimg.com/236x/47/41/19/474119c32836b1ace813e9119d778164--paw-patrol-silhouette-dog-silhouette.jpg";

    var app = new Vue({
        el: "#app",
        data: {
            on_main_page: true,
            on_post_pet_page: false,
            on_pet_page: false,
            current_user: null,
            main: {
                pet_list: [],
                pet_list_length: 0,
                pet_grid_rows: 0,
                show_feed: false,
                search_query: null,
            },
            post_pet: {
                pet_title: null,
                pet_description: null,
                pet_type: null,
                pet_price: null,
                image_url: null,
                image_file: null,
                pet_owner_phone_number: "",
                errors: []
            },
            pet: {
                pet_idx: null,
                pet_title: "",
                pet_description: "",
                pet_type: "",
                pet_price: "",
                image_url: null,
                pet_owner_email: "",
                pet_owner_phone_number: "",
            }
        },
        methods: {
            
            // navigation

            main_page: main_page,
            post_pet_page: post_pet_page,
            pet_page: pet_page,


            // main page
            search_pets: search_pets,


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

    function search_pets(e){
        if(e.keyCode === 13) {

            if (!app.main.search_query) {
                get_pets();
                return
            }

            $.getJSON(get_pet_query_url, {
                query: app.main.search_query,
            }, function(data) {
                app.main.pet_list = data.pet_list;
                process_pets();
            });
        }
    }

    
    // MARK: Post pet page

    function submit_button_clicked() {
        console.log("submit button clicked on post pet screen");
        console.log(app.post_pet.pet_title);
        console.log(app.post_pet.pet_description);
        console.log(app.post_pet.pet_type);
        console.log(app.post_pet.image_url);

        if (validate_form() == true) {
            post_data();
            return
        }

        console.log(app.post_pet.errors.length);
        
    }

    function post_data() {
        var petDescription;
        var petOwnerPhoneNumber;
        var petImageURL;
        var petPrice = "$" + app.post_pet.pet_price;

        if (!app.post_pet.pet_description) {
            petDescription = "No Description";
        } else {
            petDescription = app.post_pet.pet_description;
        }

        if (!app.post_pet.pet_image_url) {
            petImageURL = default_image_url;
        } else {

            petImageURL = app.post_pet.pet_image_url;
        }

        if (!app.post_pet.pet_owner_phone_number) {
            petOwnerPhoneNumber = "No Phone Number";
        } else {
            petOwnerPhoneNumber = format_phone_number(app.post_pet.pet_owner_phone_number);
        }


        $.post(add_pet_url, {
            pet_title: app.post_pet.pet_title,
            pet_description: petDescription,
            pet_type: app.post_pet.pet_type,
            pet_owner_phone_number: petOwnerPhoneNumber,
            pet_image_url: petImageURL,
            pet_price: petPrice
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
            $.getJSON(get_upload_url,
                function (data) {
                    // We now have upload (and download) URLs.
                    // The PUT url is used to upload the image.
                    // The GET url is used to notify the server where the image has been uploaded;
                    // that is, the GET url is the location where the image will be accessible 
                    // after the upload.  We pass the GET url to the upload_complete function (below)
                    // to notify the server. 
                    var put_url = data.signed_url;
                    //var get_url = data.access_url;
                    // console.log("Received upload url: " + get_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    // We listen to the load event = the file is uploaded, and we call upload_complete.
                    // That function will notify the server of the location of the image. 
                    req.onreadystatechange= function(){
                    if (req.readyState==4 || req.readyState=="complete") {
                        var get_url = data.access_url;
                        console.log('The file was uploaded; it is now available at ' + get_url);
                        app.post_pet.pet_image_url = get_url;
                        console.log(app.post_pet.pet_image_url);
                    }
    }
                    req.addEventListener("load", upload_complete(req));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);

                    console.log("🤯" + req.readyState);
                    });
        }
    }

    function upload_complete(req) {
        //var get_url = data.access_url;
        //console.log('The file was uploaded; it is now available at ' + get_url);
        // app.post_pet.image_url = data.access_url;
        console.log("💩" + req.readyState)
    }

    function change_image_url(event) {
        var input = event.target;
        var file = input.files[0];

        app.post_pet.image_file = file;
        upload_file();
    }

    function validate_form() {
        app.post_pet.errors = [];

        if (!app.post_pet.pet_title) {
            console.log("yip");
            app.post_pet.errors.push("Post title required");
        }

        if (!app.post_pet.pet_type) {
            console.log("yap");
            app.post_pet.errors.push("Pet type required");
        }

        if (!app.post_pet.pet_price) {
            console.log("yop");
            app.post_pet.errors.push("Pet price required");
        }

        if (app.post_pet.errors.length > 0) {
            return false;
        }
        return true;
    }


    // MARK: Pet page

    function get_pet_data(pet_id) {
        if (pet_id != null) {
            $.getJSON(get_pet_data_url, {
                pet_id: pet_id,
            }, function(data) {
                app.pet.pet_title = data.pet.pet_title;
                app.pet.pet_description = data.pet.pet_description;
                app.pet.pet_type = data.pet.pet_type;
                app.pet.pet_image_url = data.pet.pet_image_url;
                app.pet.pet_price = data.pet.pet_price;
                app.pet.pet_date = data.pet.pet_date;
                app.pet.pet_owner_phone_number = data.pet.pet_owner_phone_number;
                app.pet.pet_owner_email = data.pet.pet_owner_email;
                console.log(app.pet.pet_image_url);
            }
        );
        console.log("I fired the get");
        }
    }

    function back_button_clicked() {
        clear_form_data();
        main_page();
    }


    // MARK: Helpers

    function clear_form_data(){
        // post pet data
        app.post_pet.pet_title = "";
        app.post_pet.pet_description = "";
        app.post_pet.pet_type = "";
        app.post_pet.pet_price = "";
        app.post_pet.image_url = null;
        app.post_pet.image_file = "";
        app.post_pet.pet_owner_phone_number = "";

        // single pet data
        app.pet.pet_idx = null;
        app.pet.pet_title = "";
        app.pet.pet_description = "";
        app.pet.pet_type = "";
        app.pet.pet_price = "";
        app.pet.image_url = null;
        app.pet.image_file = "";
        app.pet.pet_owner_phone_number = "";
    }

    function format_phone_number(phoneNumberString) {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
        var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
        
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3]
        }
        return null 
    }

    function get_current_user() {
        $.getJSON(get_current_user_url, {
        }, function(data) {
            app.current_user = data.current_user;
        });   
    }

    function init_main() {
        get_pets();
        get_current_user();
    }

    init_main();
