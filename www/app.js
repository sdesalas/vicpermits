(function() {


    var App = this.App =  {

        init: function() {


        },

        data: {}

    };

    App.map = {

        init: function(selector) {

            this.width = $(selector).width();
            this.height = $(window).height() - 145;

            this.svg = d3.select("#main").append("svg")
                .attr("height", this.height).attr("id", "svg");

            // this.zoom = d3.behavior.zoom()
            //     .scaleExtent([1, 10])
            //     .on("zoom", function zoomed() {
            //       App.map.group.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            //     });

            // this.drag = d3.behavior.drag()
            //     .origin(function(d) { return d; })
            //     .on("dragstart", function dragstarted(d) {
            //       d3.event.sourceEvent.stopPropagation();
            //       d3.select(this).classed("dragging", true);
            //     })
            //     .on("drag", function dragged(d) {
            //       //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
            //                           console.log('drag', d, d3.event);
            //         d3.select(App.map.group).attr('transform', 'translate(' + d3.event.dx + ',' + d3.event.dy + ')')
            //     })
            //     .on("dragend", function dragended(d) {
            //       d3.select(this).classed("dragging", false);
            //     });

            this.group = this.svg.append("g");

            this.projection = d3.geo.albers()
                .center([11, -36.5])
                .rotate([-137, 0, 4])
                .parallels([-45, -50])
                .scale(1200 * 7)
                .translate([this.width / 2, this.height / 2]);

            this.path = d3.geo.path()
                .projection(this.projection);

            queue()
                .defer(d3.json, "data/victoria.topojson")
                .defer(d3.tsv, "data/vicpermit.bypostcode.txt", function(d) { return d;})
                .await(this.onready);

            // Load this bigger file separately
            d3.tsv("data/vicpermit.bydate.txt", function(d) { App.data.bydate = d; });

            //Add event listeners
            var svg = this.svg[0];
            $(svg).mousewheel(function(e) {
                if (e && e.deltaY) {
                    App.map.zoom(e.deltaY > 0, e.srcElement);
                }
            });


            $(this.group[0])
              .draggable()
              .bind('mousedown', function(event, ui){
                // bring target to front
                $(event.target.parentElement).append( event.target );
              })
              .bind('drag', function(event, ui){
                    App.map.drag(event, ui);
              });


        },

        onready: function(error, vicmap, bypostcode) {

            // ALL READY? GO!
            App.data.vicmap = vicmap;

            // Create an index of postcodes
            App.data.postcodes = {};

            for(var i = 0; i < bypostcode.length; i++) {
                App.data.postcodes[bypostcode[i].postcode] = bypostcode[i];
            }

            console.log('Loaded!', App.data);

            App.map.group.selectAll(".postcode")
              .data(topojson.feature(vicmap, vicmap.objects["Victoria.Postcodes.2"]).features)
            .enter().append("path")
              .attr("class", function(d) { return "postcode" })
              .attr("id", function(d) { return "p" + d.id; })
              .attr("d", App.map.path);

            App.map.showPostcodes();

        },

        showPostcodes: function() {

           $('.postcode').each(function(i, e) {
                var postcode = e.id.substr(1);
                var d = App.data.postcodes[postcode];
                if (d) {
                    $(e).css('fill-opacity', d.opacity * 1.5);
                }
           });

        },

        scale: 1,

        zoom: function(inward, source) {
            var d = source.__data__;

            if (d) {
                var centroid = this.path.centroid(d);
                this.x = centroid[0];
                this.y = centroid[1];
                this.centered = d;
            }

            if (inward) {
                this.scale = this.scale * 1.4;
            } else {
                this.scale = this.scale / 1.4;
            }

            if (this.scale < 0.5) {this.scale = 0.5; return;}
            if (this.scale > 8) {this.scale = 8; return;}

            //console.log('zooming', x, y, this.scale, source, d);
            this.group.transition()
              .duration(300)
              .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')scale(' + this.scale + ')translate(' + -this.x + ',' + -this.y + ')')
              .style('stroke-width', 1 / this.scale + 'px');

        },

        drag: function(event, ui) {

            //console.log('draging', ui);
            //this.x = (this.x || this.width/2) - ((ui.position.left - ui.originalPosition.left) / 2);
            //this.y = (this.y || this.height/2) - ((ui.position.top - ui.originalPosition.top) / 2 );
            //event.target.setAttribute('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')scale(' + this.scale + ')translate(' + -this.x + ',' + -this.y + ')');
            this.x = (this.x || this.width/2) - (ui.position.left - ui.originalPosition.left) / this.scale;
            this.y = (this.y || this.height/2) - (ui.position.top - ui.originalPosition.top) / this.scale;
            console.log({x: this.x, y: this.y, dx: (ui.position.left - ui.originalPosition.left), dy: (ui.position.top - ui.originalPosition.top)});
            event.target.setAttribute('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')scale(' + this.scale + ')translate(' + -this.x + ',' + -this.y + ')');
            this.x = undefined;
            this.y = undefined;

        }

    };

    App.play = {

        init: function() {

            this.intervalId = window.setInterval(function() { App.play.tick(); }, 20);

        },

        stop: function() {

            window.clearInterval(this.intervalId);

        },

        i: 0,

        total: 0,

        tick: function() {

            if (!App.data && !App.data.bydate) { return; }

            var d = App.data.bydate[this.i];

            $('#p' + d.postcode).css('fill','red');

            if (d.cost_of_works > 0) {

                this.total += Math.floor(d.cost_of_works || 0);

                if (this.i % 2 == 0) {

                    $('#works-total').text(this.commify(this.total));
                    $('#works-date').text(d.permit_date);
                }

                /*
                $('#works-total').animateNumber({ 
                    number: this.total,
                    numberStep: function(no, tween) {
                        var output = [];
                        var reverse = Math.floor(no).toString().split('').reverse();
                        while (reverse.length) {
                            output.unshift(reverse.splice(0, 3).reverse().join(''));
                        }
                        //no..replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        $(tween.elem).text(output.join(','));
                    }
                });*/

            }


            this.i++;

        },

        commify: function(no) {
            var output = [];
            var reverse = Math.floor(no).toString().split('').reverse();
            while (reverse.length) {
                output.unshift(reverse.splice(0, 3).reverse().join(''));
            }
            return output.join(',');
        }
    }


    App.init();
    App.map.init("#main");


})();




