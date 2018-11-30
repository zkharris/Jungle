function extend(a, b) {
    for (var i = 0; i < b.length; i++) {
        a.push(b[i]);
    }
};

// Enumerates an array.
var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

var vue = new Vue({
    el: "#app",
    data: {
        pet_list: [],
        pet_grid_rows: 0,
        show_feed: false
    },
    methods: {   
    }
});

    function get_pets() {
        $.getJSON(get_pet_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                vue.pet_list = data.pet_list;
                // this.pet_list = data.pet_list;
                // Post-processing.
                process_images();
                process_pets();
                //console.log(vue.show_feed);
            }
        );
        console.log("I fired the get");
    }

    function process_images() {

    }

    function process_pets() {
        enumerate(vue.pet_list);

        for(var i = 0; i < vue.pet_list.length; i++){
            console.log(vue.pet_list[i].pet_title);
        }

        vue.pet_list.map(function (e) {
            Vue.set(e, 'pet_image_url', e.pet_image_url);
            Vue.set(e, 'pet_title', e.pet_title);
            Vue.set(e, 'pet_date', e.pet_date);
            Vue.set(e, 'pet_price', e.pet_price);
        });

        vue.show_feed = true;
    }
 

get_pets();
