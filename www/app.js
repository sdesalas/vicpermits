(function() {


    var App = this.App =  {

        init: function() {

            if ($.browser.chrome || $.browser.safari) {

                App.map.init("#main");
                App.legend.init("#legend");
                App.timeline.init("#play");

            } else {

                $('#main').css('background','none');
                $('#nobrowser').show();
            }

        },

        data: {}

    };

    App.map = {

        init: function(selector) {

            this.width = $(selector).width();
            this.height = $(window).height() - 150;

            this.svg = d3.select("#svg").attr("height", this.height);

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
                .center([11, -37.3])
                .rotate([-137, 0, 4])
                .parallels([-45, -50])
                .scale(1200 * 14)
                .translate([this.width / 2, this.height / 2]);

            this.path = d3.geo.path()
                .projection(this.projection);

            // Load this bigger file separately
            d3.tsv("data/vicpermit.timeline.txt", function(d) { 
                //console.log('loaded timeline', d);
                App.data.timeline = d; 
            });

            //Add zoom listener
            var svg = this.svg[0];
            $(svg).mousewheel(function(e) {
                if (e && e.deltaY) {
                    App.map.zoom(e.deltaY > 0, e.srcElement);
                }
            });

            // Add dragging behaviour on group
            $(this.group[0])
              .draggable()
              .bind('mousedown', function(event, ui){
                // bring target to front
                $(event.target.parentElement).append( event.target );
              })
              .bind('drag', function(event, ui){
                    App.map.drag(event, ui);
              });


              d3.json("data/victoria.topojson", function(d) {

                    App.data.vicmap = d;
                    App.map.show(2013);

              });



        },


        show: function(year) {

            switch(Math.floor(year)) {

                case 2010:
                case 2011:
                case 2012:
                case 2013:
                    this.year = year;
                    App.timeline.reset = true;
                    App.timeline.stop();
                    queue()
                        .defer(d3.tsv, "data/vicpermit.bypostcode." + year + ".txt", function(d) { return d;})
                        .await(this.onready);

                break;

            }


        },

        onready: function(error, bypostcode) {

            // ALL READY? GO!

            // Remove loading bar
            $(App.map.svg[0]).css('background', 'white');

            // Create an index of postcodes
            App.data.postcodes = {};
            var works_total = 0;

            for(var i = 0; i < bypostcode.length; i++) {
                App.data.postcodes[bypostcode[i].postcode] = bypostcode[i];
                works_total += Math.floor(bypostcode[i].cost_of_works);
            }

            console.log('Loaded!', App.data);

            $('#works-total').text(App.util.prettynumber(works_total));
            $('#works-date').text('Jan to Dec ' + App.map.year);

            App.map.group.selectAll(".postcode")
              .data(topojson.feature(App.data.vicmap, App.data.vicmap.objects["Victoria.Postcodes.2"]).features)
            .enter().append("path")
              .attr("class", function(d) { return "postcode" })
              .attr("id", function(d) { return "p" + d.id; })
              .attr("d", App.map.path);

            App.map.showPostcodes();

            // Show/hide legend
            $('.postcode').hover(function(e) {
                var e = e.currentTarget;
                if (e && e.id) {
                    var id = e.id.slice(1);
                    App.legend.show(id);
                    //$(e).css('stroke-width', '2px');
                }
            }, function(e) {
                App.legend.hide();
                //$(e.currentTarget).css('stroke-width', 1 / App.map.scale + 'px');
            });

        },

        showPostcodes: function() {

           $('.postcode').each(function(i, e) {
                var postcode = e.id.substr(1);
                var d = App.data.postcodes[postcode];
                var opacity = (d && d.opacity) ? d.opacity : 0;
                $(e).css('fill-opacity', opacity * 1.5);
           });

        },

        scale: 1,

        zoom: function(inward, source) {
            var d = source ? source.__data__ : null;

            if (d) {
                var centroid = this.path.centroid(d);
                this.x = centroid[0];
                this.y = centroid[1];
                this.centered = d;
            } else {
                this.x = this.width / 2;
                this.y = this.height / 2;
            }

            if (inward) {
                this.scale = this.scale * 1.4;
            } else {
                this.scale = this.scale / 1.4;
            }

            if (this.scale < 0.5) {this.scale = 0.5; return;}
            if (this.scale > 5) {this.scale = 5; return;}

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
            console.log({target: event.currentTarget, ui: ui, width: this.width, height: this.height, x: this.x, y: this.y, dx: (ui.position.left - ui.originalPosition.left), dy: (ui.position.top - ui.originalPosition.top)});
            event.target.setAttribute('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')scale(' + this.scale + ')translate(' + -this.x + ',' + -this.y + ')');
            this.x = undefined;
            this.y = undefined;

        }

    };

    App.legend = {

        init: function(selector) {

            this.dom = $(selector)[0];
            this.template = $(selector).html();

        },


        show: function(code) {

            //console.log(App.data.postcodes[code]);
            if (App.data.postcodes && App.data.postcodes[code]) {
                var d = App.data.postcodes[code];
                d.total = App.util.prettynumber(Math.floor(d.cost_of_works || 0))
                $(this.dom).html(Mustache.render(this.template, d));
                $(this.dom).show();
            };

        },

        hide: function() {
            $(this.dom).hide();
        }

    };

    App.timeline = {

        init: function(selector) {

            this.button = $(selector)[0];

        }, 

        start: function() {

            this.intervalId = window.setInterval(function() { App.timeline.tick(); }, 30);
            
            // Are we beginning? Clear backgrounds
            if (this.reset) {
                $('.postcode').css('fill-opacity', 0);
                this.reset = false;
            }

            $('ul.nav li').removeClass('active');
            $(this.button.parentNode).addClass('active');
            $(this.button).text('Stop Timelapse');

        },

        stop: function() {

            if (this.intervalId) {
                window.clearInterval(this.intervalId);
                $('ul.nav li').removeClass('active');
                $(this.button).text('Keep Playing');
                this.intervalId = 0;
            }

        },

        finish: function() {

            this.stop();
            $(this.button).text('Finished!!').css('background', '#ccc').css('color', '#666').attr('disabled','disabled');
            $(this.button).off('click');

        },

        i: 0,

        total: 0,

        reset: true,

        tick: function() {

            if (!App.data && !App.data.timeline) { return; }

            var d = App.data.timeline[this.i];
            if (!d || !d.postcodes) {return; }

            // Get all nodes matching that day
            var selector = "#p" + d.postcodes.split(',').join(',#p');
            var nodes = $(selector);

            if (nodes && nodes.length) {
                
                // Highlight all the postcodes with permits
                // issued for today
                nodes.each(function(i, e) {
                    e.permits = (e.permits || 0) + 1;
                    if (e.permits > 40) e.permits = 40;
                    if ($(e).css('fill') !== 'red') {
                        $(e).css('fill','red'); 
                    }
                    $(e).css('fill-opacity', e.permits * 0.025 )
                });

                if (d.works_total > 0) {

                    this.total += Math.floor(d.works_total || 0);

                    if (this.i % 2 == 0) {
                        $('#works-total').text(App.util.prettynumber(this.total));
                        $('#works-date').text(App.util.prettydate(d.permit_date));
                    }
                }
            }

            this.i++;

            if (this.i >= App.data.timeline.length) {

                this.finish();

            }

        }
    };


    App.util = {
        prettynumber: function(no) {
            if (!no || typeof no !== 'number') return "0";
            var output = [];
            var reverse = Math.floor(no).toString().split('').reverse();
            while (reverse.length) {
                output.unshift(reverse.splice(0, 3).reverse().join(''));
            }
            return output.join(',');
        },
        prettydate: function(date) {
            var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
            var array = date.split('-');
            var d = new Date(array[0], Math.floor(array[1]) - 1, array[2], 0, 0, 0, 0);
            return d.getDate() + " " + m_names[d.getMonth()] + " " + d.getFullYear();
        }
    };


    App.init();

    $(window).resize();

})();




