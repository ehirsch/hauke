/*!
 * glidejs
 * Version: 2.0.8
 * Glide is a responsive and touch-friendly jQuery slider. Based on CSS3 transitions with fallback to older broswers. It's simple, lightweight and fast.
 * Author: Jędrzej Chałubek <jedrzej.chalubek@gmail.com>
 * Site: http://http://glide.jedrzejchalubek.com/
 * Licensed under the MIT license
 */

;(function($, window, document, undefined){
/**
 * Animation module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Animation}
 */
var Animation = function(Glide, Core) {

    /**
     * Animation offset value.
     *
     * @var {Number}
     */
    var offset;

    /**
     * Animation constructor.
     */
    function Animation() {
    }

    /**
     * Make configured animation type.
     *
     * @param  {Number} displacement
     * @return {self}
     */
    Animation.prototype.make = function(displacement) {
        // Parse displacement to integer before use.
        offset = (typeof displacement !== 'undefined') ? parseInt(displacement) : 0;

        // Animation actual translate animation
        this[Glide.options.type]();

        return this;
    };


    /**
     * After animation callback.
     *
     * @param  {Function} callback
     * @return {Integer}
     */
    Animation.prototype.after = function(callback) {
        return setTimeout(function() {
            callback();
        }, Glide.options.animationDuration + 20);
    };


    /**
     * Slider animation type.
     *
     * @return {Void}
     */
    Animation.prototype.slider = function() {

        var translate = Glide[Glide.size] * (Glide.current - 1);
        var shift = Core.Clones.shift - Glide.paddings;

        // If we are on the first slide.
        if (Core.Run.isStart()) {
            if (Glide.options.centered) {
                shift = Math.abs(shift);
            }
            // Shift is zero.
            else {
                shift = 0;
            }
            // Hide previous arrow.
            Core.Arrows.disable('prev');
        }

        // If we are on the last slide.
        else if (Core.Run.isEnd()) {
            if (Glide.options.centered) {
                shift = Math.abs(shift);
            }
            // Double and absolute shift.
            else {
                shift = Math.abs(shift * 2);
            }
            // Hide next arrow.
            Core.Arrows.disable('next');
        }

        // We are not on the edge cases.
        else {
            // Absolute shift
            shift = Math.abs(shift);
            // Show arrows.
            Core.Arrows.enable();
        }

        // Apply translate to
        // the slider track.
        Glide.track.css({
            'transition': Core.Transition.get('all'),
            'transform': Core.Translate.set(Glide.axis, translate - shift - offset)
        });

    };


    /**
     * Carousel animation type
     *
     * @return {Void}
     */
    Animation.prototype.carousel = function() {

        // Get translate value by multiplying two
        // slider size and current slide number.
        var translate = Glide[Glide.size] * Glide.current;

        // Get animation shift.
        var shift;

        // Calculate animation shift.
        if (Glide.options.centered) {
            // Decrease clones shift with slider
            // paddings, because slider is centered.
            shift = Core.Clones.shift - Glide.paddings;
        } else {
            // Shif is only clones shift.
            shift = Core.Clones.shift;
        }

        // The flag is set and direction is previous,
        // so we are on the first slide and need
        // to make offset translate.
        if (Core.Run.isOffset('<')) {

            // Translate is 0 (left edge of the track).
            translate = 0;

            // Take off flag.
            Core.Run.flag = false;

            // Clear transition and jump to last slide,
            // after offset animation is done.
            this.after(function() {
                Glide.track.css({
                    'transition': Core.Transition.clear('all'),
                    'transform': Core.Translate.set(Glide.axis, Glide[Glide.size] * Glide.length + shift)
                });
            });

        }


        // The flag is set and direction is next,
        // so we're on the last slide and need
        // to make offset translate.
        if (Core.Run.isOffset('>')) {

            // Translate is slides width * length with addtional
            // offset (right edge of the track).
            translate = (Glide[Glide.size] * Glide.length) + Glide[Glide.size];

            // Reset flag
            Core.Run.flag = false;

            // Clear transition and jump to the first slide,
            // after offset animation is done.
            this.after(function() {
                Glide.track.css({
                    'transition': Core.Transition.clear('all'),
                    'transform': Core.Translate.set(Glide.axis, Glide[Glide.size] + shift)
                });
            });

        }

        /**
         * Actual translate apply to wrapper
         * overwrite transition (can be pre-cleared)
         */
        Glide.track.css({
            'transition': Core.Transition.get('all'),
            'transform': Core.Translate.set(Glide.axis, translate + shift - offset)
        });

    };


    /**
     * Slideshow animation type.
     *
     * @return {Void}
     */
    Animation.prototype.slideshow = function() {

        Glide.slides.css('transition', Core.Transition.get('opacity'))
            .eq(Glide.current - 1).css('opacity', 1)
            .siblings().css('opacity', 0);

    };

    // Return class.
    return new Animation();

};
;/**
 * Api module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Api}
 */
var Api = function(Glide, Core) {

    /**
     * Api constructor.
     */
    function Api() {
    }

    /**
     * Api instance.
     *
     * @return {Object}
     */
    Api.prototype.instance = function() {

        return {

            /**
             * Get current slide index.
             *
             * @return {Integer}
             */
            current: function() {
                return Glide.current;
            },


            /**
             * Go to specifed slide.
             *
             * @param  {String} distance
             * @param  {Function} callback
             * @return {Void}
             */
            go: function(distance, callback) {
                Core.Run.pause();
                Core.Run.make(distance, callback);
                Core.Run.play();
            },


            /**
             * Jump without animation to specifed slide
             *
             * @param  {String} distance
             * @param  {Function} callback
             * @return {Void}
             */
            jump: function(distance, callback) {

                // Let know that we want jumping.
                Core.Transition.jumping = true;

                // Take off jumping flag,
                // after animation.
                Core.Animation.after(function() {

                    Core.Transition.jumping = false;
                });

                // Move slider.
                Core.Run.make(distance, callback);

            },


            /**
             * Move slider by passed distance.
             *
             * @param  {Integer} distance
             * @return {Void}
             */
            move: function(distance) {
                Core.Transition.jumping = true;
                Core.Animation.make(distance);
                Core.Transition.jumping = false;
            },


            /**
             * Start autoplay.
             *
             * @return {Void}
             */
            start: function(interval) {

                // We want running, turn on flag.
                Core.Run.running = true;

                // Set autoplay duration.
                Glide.options.autoplay = parseInt(interval);

                // Run autoplay.
                Core.Run.play();

            },


            /**
             * Run autoplay.
             *
             * @return {Boolean}
             */
            play: function() {
                return Core.Run.play();
            },


            /**
             * Pause autoplay.
             *
             * @return {Integer}
             */
            pause: function() {
                return Core.Run.pause();
            },


            /**
             * Destroy slider.
             *
             * @return {Void}
             */
            destroy: function() {

                Core.Run.pause();
                Core.Clones.remove();
                Core.Helper.removeStyles([Glide.track, Glide.slides]);
                Core.Bullets.remove();
                Glide.slider.removeData('glide_api');

                Core.Events.unbind();
                Core.Touch.unbind();
                Core.Arrows.unbind();
                Core.Bullets.unbind();

                delete Glide.slider;
                delete Glide.track;
                delete Glide.slides;
                delete Glide.width;
                delete Glide.length;

            },


            /**
             * Refresh slider.
             *
             * @return {Void}
             */
            refresh: function() {
                Core.Run.pause();
                Glide.collect();
                Glide.setup();
                Core.Clones.remove().init();
                Core.Bullets.remove().init();
                Core.Build.init();
                Core.Run.make('=' + parseInt(Glide.options.startAt), Core.Run.play());
            },

        };

    };


    // Return class.
    return new Api();


};
;/**
 * Arrows module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Arrows}
 */
var Arrows = function(Glide, Core) {


    /**
     * Arrows constructor.
     */
    function Arrows() {
        this.build();
        this.bind();
    }


    /**
     * Build arrows. Gets DOM elements.
     *
     * @return {Void}
     */
    Arrows.prototype.build = function() {
        this.wrapper = Glide.slider.find('.' + Glide.options.classes.arrows);
        this.items = this.wrapper.children();
    };


    /**
     * Disable next/previous arrow.
     *
     * @param {String} type
     * @return {Void}
     */
    Arrows.prototype.disable = function(type) {
        var classes = Glide.options.classes;

        this.items.filter('.' + classes['arrow' + Core.Helper.capitalise(type)])
            .unbind('click.glide touchstart.glide')
            .addClass(classes.disabled)
            .siblings()
            .bind('click.glide touchstart.glide', this.click)
            .bind('mouseenter.glide', this.hover)
            .bind('mouseleave.glide', this.hover)
            .removeClass(classes.disabled);
    };


    /**
     * Show both arrows.
     *
     * @return {Void}
     */
    Arrows.prototype.enable = function() {
        this.bind();

        this.items.removeClass(Glide.options.classes.disabled);
    };

    /**
     * Arrow click event.
     *
     * @param {Object} event
     * @return {Void}
     */
    Arrows.prototype.click = function(event) {
        event.preventDefault();

        if (!Core.Events.disabled) {
            Core.Run.pause();
            Core.Run.make($(this).data('glide-dir'));
            Core.Animation.after(function() {
                Core.Run.play();
            });
        }
    };

    /**
     * Arrows hover event.
     *
     * @param {Object} event
     * @return {Void}
     */
    Arrows.prototype.hover = function(event) {
        if (!Core.Events.disabled) {

            switch (event.type) {
                // Start autoplay on mouse leave.
                case 'mouseleave':
                    Core.Run.play();
                    break;
                // Pause autoplay on mouse enter.
                case 'mouseenter':
                    Core.Run.pause();
                    break;
            }

        }
    };

    /**
     * Bind arrows events.
     *
     * @return {Void}
     */
    Arrows.prototype.bind = function() {
        this.items
            .on('click.glide touchstart.glide', this.click)
            .on('mouseenter.glide', this.hover)
            .on('mouseleave.glide', this.hover);
    };


    /**
     * Unbind arrows events.
     *
     * @return {Void}
     */
    Arrows.prototype.unbind = function() {
        this.items
            .off('click.glide touchstart.glide')
            .off('mouseenter.glide')
            .off('mouseleave.glide');
    };


    // Return class.
    return new Arrows();

};
;/**
 * Build module.
 *
 * @param {[type]} Glide
 * @param {[type]} Core
 * @return {Build}
 */
var Build = function(Glide, Core) {

    // Build constructor.
    function Build() {
        this.init();
    }

    /**
     * Init slider builder.
     *
     * @return {Void}
     */
    Build.prototype.init = function() {
        // Build proper slider type
        this[Glide.options.type]();

        // Set slide active class
        this.active();

        // Set slides height
        Core.Height.set();
    };

    /**
     * Check slider type.
     *
     * @param  {String} name
     * @return {Boolean}
     */
    Build.prototype.isType = function(name) {
        return Glide.options.type === name;
    };

    /**
     * Check slider mode.
     *
     * @param  {String} name
     * @return {Boolean}
     */
    Build.prototype.isMode = function(name) {
        return Glide.options.mode === name;
    };

    /**
     * Build slider type.
     *
     * @return {Void}
     */
    Build.prototype.slider = function() {

        // Turn on jumping flag.
        Core.Transition.jumping = true;

        // Apply slides width.
        Glide.slides[Glide.size](Glide[Glide.size]);

        // Apply translate.
        Glide.track.css(Glide.size, Glide[Glide.size] * Glide.length);

        // If mode is vertical apply height.
        if (this.isMode('vertical')) {
            Core.Height.set(true);
        }

        // Go to startup position.
        Core.Animation.make();

        // Turn off jumping flag.
        Core.Transition.jumping = false;

    };

    /**
     * Build carousel type.
     *
     * @return {Void}
     */
    Build.prototype.carousel = function() {

        // Turn on jumping flag.
        Core.Transition.jumping = true;

        // Update shift for carusel type.
        Core.Clones.shift = (Glide[Glide.size] * Core.Clones.items.length / 2) - Glide[Glide.size];

        // Apply slides width.
        Glide.slides[Glide.size](Glide[Glide.size]);

        // Apply translate.
        Glide.track.css(Glide.size, (Glide[Glide.size] * Glide.length) + Core.Clones.getGrowth());

        // If mode is vertical apply height.
        if (this.isMode('vertical')) {
            Core.Height.set(true);
        }

        // Go to startup position.
        Core.Animation.make();

        // Append clones.
        Core.Clones.append();

        // Turn off jumping flag.
        Core.Transition.jumping = false;

    };

    /**
     * Build slideshow type.
     *
     * @return {Void}
     */
    Build.prototype.slideshow = function() {

        // Turn on jumping flag
        Core.Transition.jumping = true;

        // Go to startup position
        Core.Animation.make();

        // Turn off jumping flag
        Core.Transition.jumping = false;

    };

    /**
     * Set active class to current slide.
     *
     * @return {Void}
     */
    Build.prototype.active = function() {

        Glide.slides
            .eq(Glide.current - 1).addClass(Glide.options.classes.active)
            .siblings().removeClass(Glide.options.classes.active);

    };

    // Return class.
    return new Build();

};
;/**
 * Bullets module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Bullets}
 */
var Bullets = function(Glide, Core) {

    /**
     * Bullets constructor.
     */
    function Bullets() {
        this.init();
        this.bind();
    }

    /**
     * Init bullets builder.
     *
     * @return {self}
     */
    Bullets.prototype.init = function() {
        this.build();
        this.active();

        return this;
    };

    /**
     * Get DOM and setup bullets.
     *
     * @return {Void}
     */
    Bullets.prototype.build = function() {

        // Get bullets wrapper.
        this.wrapper = Glide.slider.children('.' + Glide.options.classes.bullets);

        // Set class and direction to each bullet.
        for (var i = 1; i <= Glide.length; i++) {
            $('<button>', {
                'class': Glide.options.classes.bullet,
                'data-glide-dir': '=' + i
            }).appendTo(this.wrapper);
        }

        // Get all bullets.
        this.items = this.wrapper.children();

    };

    /**
     * Handle active class. Adding and removing active class.
     *
     * @return {Void}
     */
    Bullets.prototype.active = function() {
        this.items.eq(Glide.current - 1)
            .addClass('active')
            .siblings().removeClass('active');
    };

    /**
     * Delete all bullets.
     *
     * @return {self}
     */
    Bullets.prototype.remove = function() {
        this.items.remove();

        return this;
    };

    /**
     * Bullet click event.
     *
     * @param {Object} event
     */
    Bullets.prototype.click = function(event) {
        event.preventDefault();

        if (!Core.Events.disabled) {
            Core.Run.pause();
            Core.Run.make($(this).data('glide-dir'));
            Core.Animation.after(function() {
                Core.Run.play();
            });
        }
    };

    /**
     * Bullets hover event.
     *
     * @param {Object} event
     * @return {Void}
     */
    Bullets.prototype.hover = function(event) {
        if (!Core.Events.disabled) {

            switch (event.type) {
                // Start autoplay on mouse leave.
                case 'mouseleave':
                    Core.Run.play();
                    break;
                // Pause autoplay on mouse enter.
                case 'mouseenter':
                    Core.Run.pause();
                    break;
            }

        }
    };

    /**
     * Bind bullets events.
     *
     * @return {Void}
     */
    Bullets.prototype.bind = function() {
        this.wrapper
            .on('click.glide touchstart.glide', 'button', this.click)
            .on('mouseenter.glide', 'button', this.hover)
            .on('mouseleave.glide', 'button', this.hover);
    };

    /**
     * Unbind bullets events.
     *
     * @return {Void}
     */
    Bullets.prototype.unbind = function() {
        this.wrapper
            .off('click.glide touchstart.glide', 'button')
            .off('mouseenter.glide', 'button')
            .off('mouseleave.glide', 'button');
    };

    // Return class.
    return new Bullets();

};
;/**
 * Clones module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Void}
 */
var Clones = function(Glide, Core) {

    /**
     * Clones position map.
     *
     * @type {Array}
     */
    var map = [0, 1];

    /**
     * Clones order pattern.
     *
     * @type {Array}
     */
    var pattern;

    /**
     * Clones constructor.
     */
    function Clones() {
        this.items = [];
        this.shift = 0;

        this.init();
    }

    /**
     * Init clones builder.
     *
     * @return {self}
     */
    Clones.prototype.init = function() {

        // Map clones order pattern.
        this.map();

        // Collect slides to clone
        // with created pattern.
        this.collect();

        return this;

    };

    /**
     * Generate clones pattern.
     *
     * @return {Void}
     */
    Clones.prototype.map = function() {
        var i;
        pattern = [];

        for (i = 0; i < map.length; i++) {
            pattern.push(-1 - i, i);
        }
    };

    /**
     * Collect clones with pattern.
     *
     * @return {Void}
     */
    Clones.prototype.collect = function() {
        var item;
        var i;

        for (i = 0; i < pattern.length; i++) {
            item = Glide.slides.eq(pattern[i])
                .clone().addClass(Glide.options.classes.clone);

            this.items.push(item);
        }
    };

    /**
     * Append cloned slides with generated pattern.
     *
     * @return {Void}
     */
    Clones.prototype.append = function() {
        var i;
        var item;

        for (i = 0; i < this.items.length; i++) {
            item = this.items[i][Glide.size](Glide[Glide.size]);

            // Append clone if pattern position is positive.
            if (pattern[i] >= 0) {
                item.appendTo(Glide.track);
            // Prepend clone if pattern position is negative.
            } else {
                item.prependTo(Glide.track);
            }
        }
    };

    /**
     * Remove all cloned slides.
     *
     * @return {self}
     */
    Clones.prototype.remove = function() {
        var i;

        for (i = 0; i < this.items.length; i++) {
            this.items[i].remove();
        }

        return this;
    };

    /**
     * Get size grow caused by clones.
     *
     * @return {Number}
     */
    Clones.prototype.getGrowth = function() {
        return Glide.width * this.items.length;
    };

    // Return class.
    return new Clones();

};
;/**
 * Glide core.
 *
 * @param {Object} Glide
 * @param {Object} Modules
 * @return {Core}
 */
var Core = function(Glide, Modules) {

    /**
     * Core constructor. Construct modules and
     * inject Glide and Core as dependency.
     *
     * @return {Void}
     */
    function Core() {

        for (var module in Modules) {
            this[module] = new Modules[module](Glide, this);
        }

    }

    // Return class.
    return new Core();

};
;/**
 * Events module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Events}
 */
var Events = function(Glide, Core) {

    /**
     * Collection of triggers.
     *
     * @type {Object}
     */
    var triggers = $('[data-glide-trigger]');

    /**
     * Events constructor.
     */
    function Events() {
        this.disabled = false;

        this.keyboard();
        this.hoverpause();
        this.resize();
        this.bindTriggers();
    }

    /**
     * Bind keyboard events.
     *
     * @return {Void}
     */
    Events.prototype.keyboard = function() {
        if (Glide.options.keyboard) {
            $(window).on('keyup.glide', function(event) {
                if (event.keyCode === 39) {
                    Core.Run.make('>');
                }
                if (event.keyCode === 37) {
                    Core.Run.make('<');
                }
            });
        }
    };

    /**
     * Bind hoverpause event.
     *
     * @return {Void}
     */
    Events.prototype.hoverpause = function() {

        if (Glide.options.hoverpause) {

            Glide.track
                .on('mouseover.glide', function() {
                    Core.Run.pause();
                    Core.Events.trigger('mouseOver');
                })
                .on('mouseout.glide', function() {
                    Core.Run.play();
                    Core.Events.trigger('mouseOut');
                });

        }

    };

    /**
     * Bind resize window event.
     *
     * @return {Void}
     */
    Events.prototype.resize = function() {

        $(window).on('resize.glide.' + Glide.uuid, Core.Helper.throttle(function() {
            Core.Transition.jumping = true;
            Glide.setup();
            Core.Build.init();
            Core.Run.make('=' + Glide.current, false);
            Core.Run.play();
            Core.Transition.jumping = false;
        }, Glide.options.throttle));

    };

    /**
     * Bind triggers events.
     *
     * @return {Void}
     */
    Events.prototype.bindTriggers = function() {
        if (triggers.length) {
            triggers
                .off('click.glide touchstart.glide')
                .on('click.glide touchstart.glide', this.handleTrigger);
        }
    };

    /**
     * Hande trigger event.
     *
     * @param {Object} event
     * @return {Void}
     */
    Events.prototype.handleTrigger = function(event) {
        event.preventDefault();

        var targets = $(this).data('glide-trigger').split(" ");

        if (!this.disabled) {
            for (var el in targets) {
                var target = $(targets[el]).data('glide_api');
                target.pause();
                target.go($(this).data('glide-dir'), this.activeTrigger);
                target.play();
            }
        }
    };

    /**
     * Disable all events.
     *
     * @return {self}
     */
    Events.prototype.disable = function() {
        this.disabled = true;

        return this;
    };

    /**
     * Enable all events.
     *
     * @return {self}
     */
    Events.prototype.enable = function() {
        this.disabled = false;

        return this;
    };

    /**
     * Detach anchors clicks inside track.
     *
     * @return {self}
     */
    Events.prototype.detachClicks = function() {
        Glide.track.find('a').each(function(i, a) {
            $(a).attr('data-href', $(a).attr('href')).removeAttr('href');
        });

        return this;
    };

    /**
     * Attach anchors clicks inside track.
     *
     * @return {self}
     */
    Events.prototype.attachClicks = function() {
        Glide.track.find('a').each(function(i, a) {
            $(a).attr('href', $(a).attr('data-href'));
        });

        return this;
    };

    /**
     * Prevent anchors clicks inside track.
     *
     * @return {self}
     */
    Events.prototype.preventClicks = function(event) {
        if (event.type === 'mousemove') {
            Glide.track.one('click', 'a', function(e) {
                e.preventDefault();
            });
        }

        return this;
    };

    /*
     * Call event function with parameters.
     *
     * @param {Function} func
     * @return {self}
     */
    Events.prototype.call = function(func) {
        if ((func !== 'undefined') && (typeof func === 'function')) {
            func(this.getParams());
        }

        return this;
    };

    /**
     * Trigger event.
     *
     * @param  {String} name
     * @return {self}
     */
    Events.prototype.trigger = function(name) {
        Glide.slider.trigger(name + ".glide", [this.getParams()]);

        return this;
    };

    /**
     * Get parameters for events callback.
     *
     * @return {Object}
     */
    Events.prototype.getParams = function() {
        return {
            index: Glide.current,
            length: Glide.slides.length,
            current: Glide.slides.eq(Glide.current - 1),
            slider: Glide.slider,
            swipe: {
                distance: (Core.Touch.distance || 0)
            }
        };
    };

    /*
     * Unbind all events.
     *
     * @return {Void}
     */
    Events.prototype.unbind = function() {

        Glide.track
            .off('keyup.glide')
            .off('mouseover.glide')
            .off('mouseout.glide');

        triggers
            .off('click.glide touchstart.glide');

        $(window)
            .off('keyup.glide')
            .off('resize.glide.' + Glide._uid);

    };

    // Return class.
    return new Events();

};
;/**
 * Height module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Height}
 */
var Height = function(Glide, Core) {

    /**
     * Height constructor.
     */
    function Height() {
        if (Glide.options.autoheight) {
            Glide.wrapper.css({
                'transition': Core.Transition.get('height'),
            });
        }
    }

    /**
     * Get current slide height.
     *
     * @return {Number}
     */
    Height.prototype.get = function() {
        var offset = (Glide.axis === 'y') ? Glide.paddings * 2 : 0;

        return Glide.slides.eq(Glide.current - 1).height() + offset;
    };

    /**
     * Set slider height.
     *
     * @param {Boolean} force Force height setting even if option is turn off.
     * @return {Boolean}
     */
    Height.prototype.set = function(force) {
        return (Glide.options.autoheight || force) ? Glide.wrapper.height(this.get()) : false;
    };

    // @return Height
    return new Height();

};
;/**
 * helper module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Helper}
 */
var Helper = function(Glide, Core) {

    /**
     * Helper constructor.
     */
    function Helper() {
    }

    /**
     * If slider axis is vertical (y axis) return vertical value
     * else axis is horizontal (x axis) so return horizontal value.
     *
     * @param  {Mixed} hValue
     * @param  {Mixed} vValue
     * @return {Mixed}
     */
    Helper.prototype.byAxis = function(hValue, vValue) {
        if (Glide.axis === 'y') {
            return vValue;
        }

        return hValue;
    };

    /**
     * Capitalise string.
     *
     * @param  {String} s
     * @return {String}
     */
    Helper.prototype.capitalise = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * Get time.
     *
     * @version Underscore.js 1.8.3
     * @source http://underscorejs.org/
     * @copyright (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors. Underscore may be freely distributed under the MIT license.
     * @return {String}
     */
    Helper.prototype.now = Date.now || function() {
        return new Date().getTime();
    };

    /**
     * Throttle.
     *
     * @version Underscore.js 1.8.3
     * @source http://underscorejs.org/
     * @copyright (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors. Underscore may be freely distributed under the MIT license.
     */
    Helper.prototype.throttle = function(func, wait, options) {
        var that = this;
        var context;
        var args;
        var result;
        var timeout = null;
        var previous = 0;
        if (!options) {
            options = {};
        }
        var later = function() {
            previous = options.leading === false ? 0 : that.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };
        return function() {
            var now = that.now();
            if (!previous && options.leading === false) {
                previous = now;
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    /**
     * Remove transition.
     *
     * @return {Void}
     */
    Helper.prototype.removeStyles = function(elements) {
        for (var i = 0; i < elements.length; i++) {
            elements[i].removeAttr('style');
        }
    };

    // Return class.
    return new Helper();

};
;/**
 * Run module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Run}
 */
var Run = function(Glide, Core) {

    /**
     * Run constructor.
     */
    function Run() {

        // Running flag. It's in use when autoplay is disabled
        // via options, but we want start autoplay via api.
        this.running = false;

        // Flag for offcanvas animation to cloned slides
        this.flag = false;

        // Start running.
        this.play();
    }

    /**
     * Setup and start autoplay run.
     *
     * @return {Integer/Undefined}
     */
    Run.prototype.play = function() {

        var that = this;

        if (Glide.options.autoplay || this.running) {

            if (typeof this.interval === 'undefined') {
                this.interval = setInterval(function() {
                    that.pause();
                    that.make('>');
                    that.play();
                }, this.getInterval());
            }

        }

        return this.interval;

    };

    /**
     * Get autoplay interval cunfigured on each slide.
     *
     * @return {Number}
     */
    Run.prototype.getInterval = function() {
        return parseInt(Glide.slides.eq(Glide.current - 1).data('glide-autoplay')) || Glide.options.autoplay;
    };

    /**
     * Pasue autoplay animation and clear interval.
     *
     * @return {Integer/Undefined}
     */
    Run.prototype.pause = function() {

        if (Glide.options.autoplay || this.running) {
            if (this.interval >= 0) {
                this.interval = clearInterval(this.interval);
            }
        }

        return this.interval;

    };

    /**
     * Check if we are on the first slide.
     *
     * @return {Boolean}
     */
    Run.prototype.isStart = function() {
        return Glide.current === 1;
    };

    /**
     * Check if we are on the last slide.
     *
     * @return {Boolean}
     */
    Run.prototype.isEnd = function() {
        return Glide.current === Glide.length;
    };

    /**
     * Check if we are making offset run.
     *
     * @return {Boolean}
     */
    Run.prototype.isOffset = function(direction) {
        return this.flag && this.direction === direction;
    };

    /**
     * Run move animation.
     *
     * @param {String} move Code in pattern {direction}{steps} eq. "=3"
     * @param {Function} callback
     * @return {Void}
     */
    Run.prototype.make = function(move, callback) {

        // Store scope.
        var that = this;

        // Extract move direction.
        this.direction = move.substr(0, 1);

        // Extract move steps.
        this.steps = (move.substr(1)) ? move.substr(1) : 0;

        // Stop autoplay until hoverpause is not set.
        if (!Glide.options.hoverpause) {
            this.pause();
        }

        // Disable events and call before transition callback.
        if (callback !== false) {
            Core.Events.disable()
                .call(Glide.options.beforeTransition)
                .trigger('beforeTransition');
        }

        // Based on direction.
        switch (this.direction) {

            case '>':
                // When we at last slide and move forward and steps are
                // number, set flag and current slide to first.
                if (this.isEnd()) {
                    Glide.current = 1;
                    this.flag = true;
                }
                // When steps is not number, but '>'
                // scroll slider to end.
                else if (this.steps === '>') {
                    Glide.current = Glide.length;
                }
                // Otherwise change normally.
                else {
                    Glide.current = Glide.current + 1;
                }
                break;

            case '<':
                // When we at first slide and move backward and steps
                // are number, set flag and current slide to last.
                if (this.isStart()) {
                    Glide.current = Glide.length;
                    this.flag = true;
                }
                // When steps is not number, but '<'
                // scroll slider to start.
                else if (this.steps === '<') {
                    Glide.current = 1;
                }
                // Otherwise change normally.
                else {
                    Glide.current = Glide.current - 1;
                }
                break;

            case '=':
                // Jump to specifed slide.
                Glide.current = parseInt(this.steps);
                break;

        }

        // Set slides height.
        Core.Height.set();

        // Set active bullet.
        Core.Bullets.active();

        // Run actual translate animation.
        Core.Animation.make().after(function() {

            // Set active flags.
            Core.Build.active();

            // Enable events and call callbacks.
            if (callback !== false) {
                Core.Events.enable()
                    .call(callback)
                    .call(Glide.options.afterTransition)
                    .trigger('afterTransition');
            }

            // Start autoplay until hoverpause is not set.
            if (!Glide.options.hoverpause) {
                that.play();
            }

        });

        // Trigger durning animation event.
        Core.Events
            .call(Glide.options.duringTransition)
            .trigger('duringTransition');

    };

    // Return class.
    return new Run();

};
;/**
 * Touch module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Touch}
 */
var Touch = function(Glide, Core) {

    /**
     * Touch event object.
     *
     * @var {Object}
     */
    var touch;

    /**
     * Touch constructor.
     */
    function Touch() {

        this.dragging = false;

        // Bind touch event.
        if (Glide.options.touchDistance) {
            Glide.track.on({
                'touchstart.glide': $.proxy(this.start, this)
            });
        }

        // Bind mouse drag event.
        if (Glide.options.dragDistance) {
            Glide.track.on({
                'mousedown.glide': $.proxy(this.start, this)
            });
        }

    }

    /**
     * Unbind touch events.
     *
     * @return {Void}
     */
    Touch.prototype.unbind = function() {
        Glide.track
            .off('touchstart.glide mousedown.glide')
            .off('touchmove.glide mousemove.glide')
            .off('touchend.glide touchcancel.glide mouseup.glide mouseleave.glide');
    };

    /**
     * Start touch event.
     *
     * @param {Object} event
     * @return {Void}
     */
    Touch.prototype.start = function(event) {

        // Escape if events disabled
        // or already dragging.
        if (!Core.Events.disabled && !this.dragging) {

            // Store event.
            if (event.type === 'mousedown') {
                touch = event.originalEvent;
            } else {
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            }

            // Turn off jumping flag.
            Core.Transition.jumping = true;

            // Get touch start points.
            this.touchStartX = parseInt(touch.pageX);
            this.touchStartY = parseInt(touch.pageY);
            this.touchSin = null;
            this.dragging = true;

            Glide.track.on({
                'touchmove.glide mousemove.glide': Core.Helper.throttle($.proxy(this.move, this), Glide.options.throttle),
                'touchend.glide touchcancel.glide mouseup.glide mouseleave.glide': $.proxy(this.end, this)
            });

            // Detach clicks inside track.
            Core.Events.detachClicks()
                .call(Glide.options.swipeStart)
                .trigger('swipeStart');
            // Pause if autoplay.
            Core.Run.pause();

        }

    };

    /**
     * Touch move event.
     *
     * @param  {Object} event
     * @return {Void}
     */
    Touch.prototype.move = function(event) {

        // Escape if events not disabled
        // or not dragging.
        if (!Core.Events.disabled && this.dragging) {

            // Store event.
            if (event.type === 'mousemove') {
                touch = event.originalEvent;
            } else {
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            }

            // Calculate start, end points.
            var subExSx = parseInt(touch.pageX) - this.touchStartX;
            var subEySy = parseInt(touch.pageY) - this.touchStartY;
            // Bitwise subExSx pow.
            var powEX = Math.abs(subExSx << 2);
            // Bitwise subEySy pow.
            var powEY = Math.abs(subEySy << 2);
            // Calculate the length of the hypotenuse segment.
            var touchHypotenuse = Math.sqrt(powEX + powEY);
            // Calculate the length of the cathetus segment.
            var touchCathetus = Math.sqrt(Core.Helper.byAxis(powEY, powEX));

            // Calculate the sine of the angle.
            this.touchSin = Math.asin(touchCathetus / touchHypotenuse);
            // Save distance.
            this.distance = Core.Helper.byAxis(
                (touch.pageX - this.touchStartX),
                (touch.pageY - this.touchStartY)
            );

            // Make offset animation.
            // While angle is lower than 45 degree.
            if ((this.touchSin * 180 / Math.PI) < 45) {
                Core.Animation.make(Core.Helper.byAxis(subExSx, subEySy));
            }

            // Prevent clicks inside track.
            Core.Events.preventClicks(event)
                .call(Glide.options.swipeMove)
                .trigger('swipeMove');

            // While mode is vertical, we don't want to block scroll when we reach start or end of slider
            // In that case we need to escape before preventing default event.
            if (Core.Build.isMode('vertical')) {
                if (Core.Run.isStart() && subEySy > 0) {
                    return;
                }
                if (Core.Run.isEnd() && subEySy < 0) {
                    return;
                }
            }

            // While angle is lower than 45 degree.
            if ((this.touchSin * 180 / Math.PI) < 45) {
                // Prevent propagation.
                event.stopPropagation();
                // Prevent scrolling.
                event.preventDefault();
                // Add dragging class.
                Glide.track.addClass(Glide.options.classes.dragging);
            // Else escape from event, we don't want move slider.
            } else {
                return;
            }

        }

    };

    /**
     * Touch end event.
     *
     * @todo Check edge cases for slider type
     * @param {Onject} event
     */
    Touch.prototype.end = function(event) {

        // Escape if events not disabled
        // or not dragging.
        if (!Core.Events.disabled && this.dragging) {

            // Set distance limiter.
            var distanceLimiter;

            // Store event.
            if (event.type === 'mouseup' || event.type === 'mouseleave') {
                touch = event.originalEvent;
            } else {
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            }

            // Calculate touch distance.
            var touchDistance = Core.Helper.byAxis(
                (touch.pageX - this.touchStartX),
                (touch.pageY - this.touchStartY)
            );

            // Calculate degree.
            var touchDeg = this.touchSin * 180 / Math.PI;

            // Turn off jumping flag.
            Core.Transition.jumping = false;

            // If slider type is slider.
            if (Core.Build.isType('slider')) {

                // Prevent slide to right on first item (prev).
                if (Core.Run.isStart()) {
                    if (touchDistance > 0) {
                        touchDistance = 0;
                    }
                }

                // Prevent slide to left on last item (next).
                if (Core.Run.isEnd()) {
                    if (touchDistance < 0) {
                        touchDistance = 0;
                    }
                }

            }

            // Switch distance limit base on event type.
            if (event.type === 'mouseup' || event.type === 'mouseleave') {
                distanceLimiter = Glide.options.dragDistance;
            } else {
                distanceLimiter = Glide.options.touchDistance;
            }

            // While touch is positive and greater than
            // distance set in options move backward.
            if (touchDistance > distanceLimiter && touchDeg < 45) {
                Core.Run.make('<');
            }
            // While touch is negative and lower than negative
            // distance set in options move forward.
            else if (touchDistance < -distanceLimiter && touchDeg < 45) {
                Core.Run.make('>');
            }
            // While swipe don't reach distance apply previous transform.
            else {
                Core.Animation.make();
            }

            // After animation.
            Core.Animation.after(function() {
                // Enable events.
                Core.Events.enable();
                // If autoplay start auto run.
                Core.Run.play();
            });

            // Unset dragging flag.
            this.dragging = false;

            // Disable other events.
            Core.Events.attachClicks()
                .disable()
                .call(Glide.options.swipeEnd)
                .trigger('swipeEnd');

            // Remove dragging class and unbind events.
            Glide.track
                .removeClass(Glide.options.classes.dragging)
                .off('touchmove.glide mousemove.glide')
                .off('touchend.glide touchcancel.glide mouseup.glide mouseleave.glide');

        }

    };

    // Return class.
    return new Touch();

};
;/**
 * Transition module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Transition}
 */
var Transition = function(Glide, Core) {

    /**
     * Transition constructor.
     */
    function Transition() {
        this.jumping = false;
    }

    /**
     * Get transition settings.
     *
     * @param {String} property
     * @return {String}
     */
    Transition.prototype.get = function(property) {
        if (!this.jumping) {
            return property + ' ' + Glide.options.animationDuration + 'ms ' + Glide.options.animationTimingFunc;
        }

        return this.clear('all');
    };

    /**
     * Clear transition settings.
     *
     * @param {String} property
     * @return {String}
     */
    Transition.prototype.clear = function(property) {
        return property + ' 0ms ' + Glide.options.animationTimingFunc;
    };

    // Return class.
    return new Transition();

};
;/**
 * Translate module.
 *
 * @param {Object} Glide
 * @param {Object} Core
 * @return {Translate}
 */
var Translate = function(Glide, Core) {

    /**
     * Translate axes map.
     *
     * @type {Object}
     */
    var axes = {
        x: 0,
        y: 0,
        z: 0
    };

    /**
     * Translate Translate Constructor
     */
    function Translate() {
    }

    /**
     * Set translate.
     *
     * @param  {String} axis
     * @param  {Integer} value
     * @return {String}
     */
    Translate.prototype.set = function(axis, value) {
        axes[axis] = parseInt(value);

        return 'translate3d(' + (-1 * axes.x) + 'px, ' + (-1 * axes.y) + 'px, ' + (-1 * axes.z) + 'px)';
    };

    // Return class.
    return new Translate();

};
;/**
 * Construct Glide. Initialize slider, extends
 * defaults and returning public api.
 *
 * @param {Object} element
 * @param {Object} options
 */
var Glide = function(element, options) {

    /**
     * Default slider options.
     *
     * @type {Object}
     */
    var defaults = {
        autoplay: 4000,
        type: 'carousel',
        mode: 'horizontal',
        startAt: 1,
        hoverpause: true,
        keyboard: true,
        touchDistance: 80,
        dragDistance: 120,
        animationDuration: 400,
        animationTimingFunc: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        throttle: 16,
        autoheight: false,
        paddings: 0,
        centered: true,
        classes: {
            base: 'glide',
            wrapper: 'glide__wrapper',
            track: 'glide__track',
            slide: 'glide__slide',
            arrows: 'glide__arrows',
            arrow: 'glide__arrow',
            arrowNext: 'next',
            arrowPrev: 'prev',
            bullets: 'glide__bullets',
            bullet: 'glide__bullet',
            clone: 'clone',
            active: 'active',
            dragging: 'dragging',
            disabled: 'disabled'
        },
        beforeInit: function(event) {},
        afterInit: function(event) {},
        beforeTransition: function(event) {},
        duringTransition: function(event) {},
        afterTransition: function(event) {},
        swipeStart: function(event) {},
        swipeEnd: function(event) {},
        swipeMove: function(event) {},
    };

    // Extend defaults with
    // the init options.
    this.options = $.extend({}, defaults, options);

    // Generate unique slider instance id.
    this.uuid = Math.floor(Math.random() * 1000);

    // Start at slide number specifed in options.
    this.current = parseInt(this.options.startAt);

    // Store main slider DOM element.
    this.element = element;

    // Collect slider DOM and
    // init slider sizes.
    this.collect();
    this.setup();

    // Call before init callback.
    this.options.beforeInit({
        index: this.current,
        length: this.slides.length,
        current: this.slides.eq(this.current - 1),
        slider: this.slider
    });

    /**
     * Construct core with modules.
     *
     * @type {Core}
     */
    var Engine = new Core(this, {
        Helper: Helper,
        Translate: Translate,
        Transition: Transition,
        Run: Run,
        Animation: Animation,
        Clones: Clones,
        Arrows: Arrows,
        Bullets: Bullets,
        Height: Height,
        Build: Build,
        Events: Events,
        Touch: Touch,
        Api: Api
    });

    // Call after init callback.
    Engine.Events.call(this.options.afterInit);

    // Return slider Api.
    return Engine.Api.instance();

};


/**
 * Collect DOM and set classes.
 *
 * @return {void}
 */
Glide.prototype.collect = function() {
    var options = this.options;
    var classes = options.classes;

    this.slider = this.element.addClass(classes.base + '--' + options.type).addClass(classes.base + '--' + options.mode);
    this.track = this.slider.find('.' + classes.track);
    this.wrapper = this.slider.find('.' + classes.wrapper);
    this.slides = this.track.find('.' + classes.slide).not('.' + classes.clone);
};


/**
 * Setup slider dementions.
 *
 * @return {Void}
 */
Glide.prototype.setup = function() {

    /**
     * Mode to dimentions (size and axis) mapper.
     *
     * @type {Object}
     */
    var modeToDimensionsMap = {
        horizontal: ['width', 'x'],
        vertical: ['height', 'y'],
    };

    // Get slider size by active mode.
    this.size = modeToDimensionsMap[this.options.mode][0];

    // Get slider axis by active mode.
    this.axis = modeToDimensionsMap[this.options.mode][1];

    // Get slider items length.
    this.length = this.slides.length;

    // Get slider configured paddings.
    this.paddings = this.getPaddings();

    // Set slider size.
    this[this.size] = this.getSize();
};


/**
 * Normalize paddings option value. Parsing
 * strings procents, pixels and numbers.
 *
 * @return {string} Normalized value
 */
Glide.prototype.getPaddings = function() {

    var option = this.options.paddings;

    // If we have a string, we need
    // to parse it to real number.
    if (typeof option === 'string') {

        // Parse string to int.
        var normalized = parseInt(option, 10);

        // Check if string is procentage number.
        var isPercentage = option.indexOf('%') >= 0;

        // If paddings value is procentage. Calculate
        // real number value from slider element.
        if (isPercentage) {
            return parseInt(this.slider[this.size]() * (normalized / 100));
        }

        // Value is number as string, so
        // just return normalized.
        return normalized;
    }

    // Value is number, we don't need
    // to do anything, return.
    return option;

};


/**
 * Get slider size width updated
 * by addtional paddings.
 *
 * @return {number}
 */
Glide.prototype.getSize = function() {
    return this.slider[this.size]() - (this.paddings * 2);
};
;/**
 * Wire Glide to the jQuery.
 *
 * @param  {object} options
 * @return {object}
 */

$.fn.glide = function(options) {

    return this.each(function() {
        if (!$.data(this, 'glide_api')) {
            $.data(this, 'glide_api',
                new Glide($(this), options)
            );
        }
    });

};

})(jQuery, window, document);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnbGlkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcclxuICogZ2xpZGVqc1xyXG4gKiBWZXJzaW9uOiAyLjAuOFxyXG4gKiBHbGlkZSBpcyBhIHJlc3BvbnNpdmUgYW5kIHRvdWNoLWZyaWVuZGx5IGpRdWVyeSBzbGlkZXIuIEJhc2VkIG9uIENTUzMgdHJhbnNpdGlvbnMgd2l0aCBmYWxsYmFjayB0byBvbGRlciBicm9zd2Vycy4gSXQncyBzaW1wbGUsIGxpZ2h0d2VpZ2h0IGFuZCBmYXN0LlxyXG4gKiBBdXRob3I6IErEmWRyemVqIENoYcWCdWJlayA8amVkcnplai5jaGFsdWJla0BnbWFpbC5jb20+XHJcbiAqIFNpdGU6IGh0dHA6Ly9odHRwOi8vZ2xpZGUuamVkcnplamNoYWx1YmVrLmNvbS9cclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqL1xyXG5cclxuOyhmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpe1xyXG4vKipcbiAqIEFuaW1hdGlvbiBtb2R1bGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0ge09iamVjdH0gQ29yZVxuICogQHJldHVybiB7QW5pbWF0aW9ufVxuICovXG52YXIgQW5pbWF0aW9uID0gZnVuY3Rpb24oR2xpZGUsIENvcmUpIHtcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGlvbiBvZmZzZXQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAdmFyIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdmFyIG9mZnNldDtcblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGlvbiBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBBbmltYXRpb24oKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFrZSBjb25maWd1cmVkIGFuaW1hdGlvbiB0eXBlLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBkaXNwbGFjZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIEFuaW1hdGlvbi5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKGRpc3BsYWNlbWVudCkge1xuICAgICAgICAvLyBQYXJzZSBkaXNwbGFjZW1lbnQgdG8gaW50ZWdlciBiZWZvcmUgdXNlLlxuICAgICAgICBvZmZzZXQgPSAodHlwZW9mIGRpc3BsYWNlbWVudCAhPT0gJ3VuZGVmaW5lZCcpID8gcGFyc2VJbnQoZGlzcGxhY2VtZW50KSA6IDA7XG5cbiAgICAgICAgLy8gQW5pbWF0aW9uIGFjdHVhbCB0cmFuc2xhdGUgYW5pbWF0aW9uXG4gICAgICAgIHRoaXNbR2xpZGUub3B0aW9ucy50eXBlXSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEFmdGVyIGFuaW1hdGlvbiBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge0ludGVnZXJ9XG4gICAgICovXG4gICAgQW5pbWF0aW9uLnByb3RvdHlwZS5hZnRlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSwgR2xpZGUub3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbiArIDIwKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBTbGlkZXIgYW5pbWF0aW9uIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEFuaW1hdGlvbi5wcm90b3R5cGUuc2xpZGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IEdsaWRlW0dsaWRlLnNpemVdICogKEdsaWRlLmN1cnJlbnQgLSAxKTtcbiAgICAgICAgdmFyIHNoaWZ0ID0gQ29yZS5DbG9uZXMuc2hpZnQgLSBHbGlkZS5wYWRkaW5ncztcblxuICAgICAgICAvLyBJZiB3ZSBhcmUgb24gdGhlIGZpcnN0IHNsaWRlLlxuICAgICAgICBpZiAoQ29yZS5SdW4uaXNTdGFydCgpKSB7XG4gICAgICAgICAgICBpZiAoR2xpZGUub3B0aW9ucy5jZW50ZXJlZCkge1xuICAgICAgICAgICAgICAgIHNoaWZ0ID0gTWF0aC5hYnMoc2hpZnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2hpZnQgaXMgemVyby5cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNoaWZ0ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEhpZGUgcHJldmlvdXMgYXJyb3cuXG4gICAgICAgICAgICBDb3JlLkFycm93cy5kaXNhYmxlKCdwcmV2Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSBhcmUgb24gdGhlIGxhc3Qgc2xpZGUuXG4gICAgICAgIGVsc2UgaWYgKENvcmUuUnVuLmlzRW5kKCkpIHtcbiAgICAgICAgICAgIGlmIChHbGlkZS5vcHRpb25zLmNlbnRlcmVkKSB7XG4gICAgICAgICAgICAgICAgc2hpZnQgPSBNYXRoLmFicyhzaGlmdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEb3VibGUgYW5kIGFic29sdXRlIHNoaWZ0LlxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hpZnQgPSBNYXRoLmFicyhzaGlmdCAqIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSGlkZSBuZXh0IGFycm93LlxuICAgICAgICAgICAgQ29yZS5BcnJvd3MuZGlzYWJsZSgnbmV4dCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgYXJlIG5vdCBvbiB0aGUgZWRnZSBjYXNlcy5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBBYnNvbHV0ZSBzaGlmdFxuICAgICAgICAgICAgc2hpZnQgPSBNYXRoLmFicyhzaGlmdCk7XG4gICAgICAgICAgICAvLyBTaG93IGFycm93cy5cbiAgICAgICAgICAgIENvcmUuQXJyb3dzLmVuYWJsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwbHkgdHJhbnNsYXRlIHRvXG4gICAgICAgIC8vIHRoZSBzbGlkZXIgdHJhY2suXG4gICAgICAgIEdsaWRlLnRyYWNrLmNzcyh7XG4gICAgICAgICAgICAndHJhbnNpdGlvbic6IENvcmUuVHJhbnNpdGlvbi5nZXQoJ2FsbCcpLFxuICAgICAgICAgICAgJ3RyYW5zZm9ybSc6IENvcmUuVHJhbnNsYXRlLnNldChHbGlkZS5heGlzLCB0cmFuc2xhdGUgLSBzaGlmdCAtIG9mZnNldClcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBDYXJvdXNlbCBhbmltYXRpb24gdHlwZVxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBBbmltYXRpb24ucHJvdG90eXBlLmNhcm91c2VsID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gR2V0IHRyYW5zbGF0ZSB2YWx1ZSBieSBtdWx0aXBseWluZyB0d29cbiAgICAgICAgLy8gc2xpZGVyIHNpemUgYW5kIGN1cnJlbnQgc2xpZGUgbnVtYmVyLlxuICAgICAgICB2YXIgdHJhbnNsYXRlID0gR2xpZGVbR2xpZGUuc2l6ZV0gKiBHbGlkZS5jdXJyZW50O1xuXG4gICAgICAgIC8vIEdldCBhbmltYXRpb24gc2hpZnQuXG4gICAgICAgIHZhciBzaGlmdDtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgYW5pbWF0aW9uIHNoaWZ0LlxuICAgICAgICBpZiAoR2xpZGUub3B0aW9ucy5jZW50ZXJlZCkge1xuICAgICAgICAgICAgLy8gRGVjcmVhc2UgY2xvbmVzIHNoaWZ0IHdpdGggc2xpZGVyXG4gICAgICAgICAgICAvLyBwYWRkaW5ncywgYmVjYXVzZSBzbGlkZXIgaXMgY2VudGVyZWQuXG4gICAgICAgICAgICBzaGlmdCA9IENvcmUuQ2xvbmVzLnNoaWZ0IC0gR2xpZGUucGFkZGluZ3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTaGlmIGlzIG9ubHkgY2xvbmVzIHNoaWZ0LlxuICAgICAgICAgICAgc2hpZnQgPSBDb3JlLkNsb25lcy5zaGlmdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBmbGFnIGlzIHNldCBhbmQgZGlyZWN0aW9uIGlzIHByZXZpb3VzLFxuICAgICAgICAvLyBzbyB3ZSBhcmUgb24gdGhlIGZpcnN0IHNsaWRlIGFuZCBuZWVkXG4gICAgICAgIC8vIHRvIG1ha2Ugb2Zmc2V0IHRyYW5zbGF0ZS5cbiAgICAgICAgaWYgKENvcmUuUnVuLmlzT2Zmc2V0KCc8JykpIHtcblxuICAgICAgICAgICAgLy8gVHJhbnNsYXRlIGlzIDAgKGxlZnQgZWRnZSBvZiB0aGUgdHJhY2spLlxuICAgICAgICAgICAgdHJhbnNsYXRlID0gMDtcblxuICAgICAgICAgICAgLy8gVGFrZSBvZmYgZmxhZy5cbiAgICAgICAgICAgIENvcmUuUnVuLmZsYWcgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gQ2xlYXIgdHJhbnNpdGlvbiBhbmQganVtcCB0byBsYXN0IHNsaWRlLFxuICAgICAgICAgICAgLy8gYWZ0ZXIgb2Zmc2V0IGFuaW1hdGlvbiBpcyBkb25lLlxuICAgICAgICAgICAgdGhpcy5hZnRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBHbGlkZS50cmFjay5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAndHJhbnNpdGlvbic6IENvcmUuVHJhbnNpdGlvbi5jbGVhcignYWxsJyksXG4gICAgICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiBDb3JlLlRyYW5zbGF0ZS5zZXQoR2xpZGUuYXhpcywgR2xpZGVbR2xpZGUuc2l6ZV0gKiBHbGlkZS5sZW5ndGggKyBzaGlmdClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIFRoZSBmbGFnIGlzIHNldCBhbmQgZGlyZWN0aW9uIGlzIG5leHQsXG4gICAgICAgIC8vIHNvIHdlJ3JlIG9uIHRoZSBsYXN0IHNsaWRlIGFuZCBuZWVkXG4gICAgICAgIC8vIHRvIG1ha2Ugb2Zmc2V0IHRyYW5zbGF0ZS5cbiAgICAgICAgaWYgKENvcmUuUnVuLmlzT2Zmc2V0KCc+JykpIHtcblxuICAgICAgICAgICAgLy8gVHJhbnNsYXRlIGlzIHNsaWRlcyB3aWR0aCAqIGxlbmd0aCB3aXRoIGFkZHRpb25hbFxuICAgICAgICAgICAgLy8gb2Zmc2V0IChyaWdodCBlZGdlIG9mIHRoZSB0cmFjaykuXG4gICAgICAgICAgICB0cmFuc2xhdGUgPSAoR2xpZGVbR2xpZGUuc2l6ZV0gKiBHbGlkZS5sZW5ndGgpICsgR2xpZGVbR2xpZGUuc2l6ZV07XG5cbiAgICAgICAgICAgIC8vIFJlc2V0IGZsYWdcbiAgICAgICAgICAgIENvcmUuUnVuLmZsYWcgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gQ2xlYXIgdHJhbnNpdGlvbiBhbmQganVtcCB0byB0aGUgZmlyc3Qgc2xpZGUsXG4gICAgICAgICAgICAvLyBhZnRlciBvZmZzZXQgYW5pbWF0aW9uIGlzIGRvbmUuXG4gICAgICAgICAgICB0aGlzLmFmdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIEdsaWRlLnRyYWNrLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICd0cmFuc2l0aW9uJzogQ29yZS5UcmFuc2l0aW9uLmNsZWFyKCdhbGwnKSxcbiAgICAgICAgICAgICAgICAgICAgJ3RyYW5zZm9ybSc6IENvcmUuVHJhbnNsYXRlLnNldChHbGlkZS5heGlzLCBHbGlkZVtHbGlkZS5zaXplXSArIHNoaWZ0KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBY3R1YWwgdHJhbnNsYXRlIGFwcGx5IHRvIHdyYXBwZXJcbiAgICAgICAgICogb3ZlcndyaXRlIHRyYW5zaXRpb24gKGNhbiBiZSBwcmUtY2xlYXJlZClcbiAgICAgICAgICovXG4gICAgICAgIEdsaWRlLnRyYWNrLmNzcyh7XG4gICAgICAgICAgICAndHJhbnNpdGlvbic6IENvcmUuVHJhbnNpdGlvbi5nZXQoJ2FsbCcpLFxuICAgICAgICAgICAgJ3RyYW5zZm9ybSc6IENvcmUuVHJhbnNsYXRlLnNldChHbGlkZS5heGlzLCB0cmFuc2xhdGUgKyBzaGlmdCAtIG9mZnNldClcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBTbGlkZXNob3cgYW5pbWF0aW9uIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEFuaW1hdGlvbi5wcm90b3R5cGUuc2xpZGVzaG93ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgR2xpZGUuc2xpZGVzLmNzcygndHJhbnNpdGlvbicsIENvcmUuVHJhbnNpdGlvbi5nZXQoJ29wYWNpdHknKSlcbiAgICAgICAgICAgIC5lcShHbGlkZS5jdXJyZW50IC0gMSkuY3NzKCdvcGFjaXR5JywgMSlcbiAgICAgICAgICAgIC5zaWJsaW5ncygpLmNzcygnb3BhY2l0eScsIDApO1xuXG4gICAgfTtcblxuICAgIC8vIFJldHVybiBjbGFzcy5cbiAgICByZXR1cm4gbmV3IEFuaW1hdGlvbigpO1xuXG59O1xuOy8qKlxuICogQXBpIG1vZHVsZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBDb3JlXG4gKiBAcmV0dXJuIHtBcGl9XG4gKi9cbnZhciBBcGkgPSBmdW5jdGlvbihHbGlkZSwgQ29yZSkge1xuXG4gICAgLyoqXG4gICAgICogQXBpIGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFwaSgpIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcGkgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgQXBpLnByb3RvdHlwZS5pbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR2V0IGN1cnJlbnQgc2xpZGUgaW5kZXguXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHJldHVybiB7SW50ZWdlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY3VycmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEdsaWRlLmN1cnJlbnQ7XG4gICAgICAgICAgICB9LFxuXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR28gdG8gc3BlY2lmZWQgc2xpZGUuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtICB7U3RyaW5nfSBkaXN0YW5jZVxuICAgICAgICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnbzogZnVuY3Rpb24oZGlzdGFuY2UsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgQ29yZS5SdW4ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICBDb3JlLlJ1bi5tYWtlKGRpc3RhbmNlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgQ29yZS5SdW4ucGxheSgpO1xuICAgICAgICAgICAgfSxcblxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEp1bXAgd2l0aG91dCBhbmltYXRpb24gdG8gc3BlY2lmZWQgc2xpZGVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGRpc3RhbmNlXG4gICAgICAgICAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgICAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGp1bXA6IGZ1bmN0aW9uKGRpc3RhbmNlLCBjYWxsYmFjaykge1xuXG4gICAgICAgICAgICAgICAgLy8gTGV0IGtub3cgdGhhdCB3ZSB3YW50IGp1bXBpbmcuXG4gICAgICAgICAgICAgICAgQ29yZS5UcmFuc2l0aW9uLmp1bXBpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgLy8gVGFrZSBvZmYganVtcGluZyBmbGFnLFxuICAgICAgICAgICAgICAgIC8vIGFmdGVyIGFuaW1hdGlvbi5cbiAgICAgICAgICAgICAgICBDb3JlLkFuaW1hdGlvbi5hZnRlcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBDb3JlLlRyYW5zaXRpb24uanVtcGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gTW92ZSBzbGlkZXIuXG4gICAgICAgICAgICAgICAgQ29yZS5SdW4ubWFrZShkaXN0YW5jZSwgY2FsbGJhY2spO1xuXG4gICAgICAgICAgICB9LFxuXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTW92ZSBzbGlkZXIgYnkgcGFzc2VkIGRpc3RhbmNlLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSAge0ludGVnZXJ9IGRpc3RhbmNlXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBtb3ZlOiBmdW5jdGlvbihkaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBDb3JlLkFuaW1hdGlvbi5tYWtlKGRpc3RhbmNlKTtcbiAgICAgICAgICAgICAgICBDb3JlLlRyYW5zaXRpb24uanVtcGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSxcblxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFN0YXJ0IGF1dG9wbGF5LlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbihpbnRlcnZhbCkge1xuXG4gICAgICAgICAgICAgICAgLy8gV2Ugd2FudCBydW5uaW5nLCB0dXJuIG9uIGZsYWcuXG4gICAgICAgICAgICAgICAgQ29yZS5SdW4ucnVubmluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgYXV0b3BsYXkgZHVyYXRpb24uXG4gICAgICAgICAgICAgICAgR2xpZGUub3B0aW9ucy5hdXRvcGxheSA9IHBhcnNlSW50KGludGVydmFsKTtcblxuICAgICAgICAgICAgICAgIC8vIFJ1biBhdXRvcGxheS5cbiAgICAgICAgICAgICAgICBDb3JlLlJ1bi5wbGF5KCk7XG5cbiAgICAgICAgICAgIH0sXG5cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSdW4gYXV0b3BsYXkuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIENvcmUuUnVuLnBsYXkoKTtcbiAgICAgICAgICAgIH0sXG5cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBQYXVzZSBhdXRvcGxheS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtJbnRlZ2VyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIENvcmUuUnVuLnBhdXNlKCk7XG4gICAgICAgICAgICB9LFxuXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRGVzdHJveSBzbGlkZXIuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBDb3JlLlJ1bi5wYXVzZSgpO1xuICAgICAgICAgICAgICAgIENvcmUuQ2xvbmVzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIENvcmUuSGVscGVyLnJlbW92ZVN0eWxlcyhbR2xpZGUudHJhY2ssIEdsaWRlLnNsaWRlc10pO1xuICAgICAgICAgICAgICAgIENvcmUuQnVsbGV0cy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBHbGlkZS5zbGlkZXIucmVtb3ZlRGF0YSgnZ2xpZGVfYXBpJyk7XG5cbiAgICAgICAgICAgICAgICBDb3JlLkV2ZW50cy51bmJpbmQoKTtcbiAgICAgICAgICAgICAgICBDb3JlLlRvdWNoLnVuYmluZCgpO1xuICAgICAgICAgICAgICAgIENvcmUuQXJyb3dzLnVuYmluZCgpO1xuICAgICAgICAgICAgICAgIENvcmUuQnVsbGV0cy51bmJpbmQoKTtcblxuICAgICAgICAgICAgICAgIGRlbGV0ZSBHbGlkZS5zbGlkZXI7XG4gICAgICAgICAgICAgICAgZGVsZXRlIEdsaWRlLnRyYWNrO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBHbGlkZS5zbGlkZXM7XG4gICAgICAgICAgICAgICAgZGVsZXRlIEdsaWRlLndpZHRoO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBHbGlkZS5sZW5ndGg7XG5cbiAgICAgICAgICAgIH0sXG5cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZWZyZXNoIHNsaWRlci5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBDb3JlLlJ1bi5wYXVzZSgpO1xuICAgICAgICAgICAgICAgIEdsaWRlLmNvbGxlY3QoKTtcbiAgICAgICAgICAgICAgICBHbGlkZS5zZXR1cCgpO1xuICAgICAgICAgICAgICAgIENvcmUuQ2xvbmVzLnJlbW92ZSgpLmluaXQoKTtcbiAgICAgICAgICAgICAgICBDb3JlLkJ1bGxldHMucmVtb3ZlKCkuaW5pdCgpO1xuICAgICAgICAgICAgICAgIENvcmUuQnVpbGQuaW5pdCgpO1xuICAgICAgICAgICAgICAgIENvcmUuUnVuLm1ha2UoJz0nICsgcGFyc2VJbnQoR2xpZGUub3B0aW9ucy5zdGFydEF0KSwgQ29yZS5SdW4ucGxheSgpKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfTtcblxuICAgIH07XG5cblxuICAgIC8vIFJldHVybiBjbGFzcy5cbiAgICByZXR1cm4gbmV3IEFwaSgpO1xuXG5cbn07XG47LyoqXG4gKiBBcnJvd3MgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtIHtPYmplY3R9IENvcmVcbiAqIEByZXR1cm4ge0Fycm93c31cbiAqL1xudmFyIEFycm93cyA9IGZ1bmN0aW9uKEdsaWRlLCBDb3JlKSB7XG5cblxuICAgIC8qKlxuICAgICAqIEFycm93cyBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBBcnJvd3MoKSB7XG4gICAgICAgIHRoaXMuYnVpbGQoKTtcbiAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCBhcnJvd3MuIEdldHMgRE9NIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBBcnJvd3MucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMud3JhcHBlciA9IEdsaWRlLnNsaWRlci5maW5kKCcuJyArIEdsaWRlLm9wdGlvbnMuY2xhc3Nlcy5hcnJvd3MpO1xuICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy53cmFwcGVyLmNoaWxkcmVuKCk7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZSBuZXh0L3ByZXZpb3VzIGFycm93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEFycm93cy5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGNsYXNzZXMgPSBHbGlkZS5vcHRpb25zLmNsYXNzZXM7XG5cbiAgICAgICAgdGhpcy5pdGVtcy5maWx0ZXIoJy4nICsgY2xhc3Nlc1snYXJyb3cnICsgQ29yZS5IZWxwZXIuY2FwaXRhbGlzZSh0eXBlKV0pXG4gICAgICAgICAgICAudW5iaW5kKCdjbGljay5nbGlkZSB0b3VjaHN0YXJ0LmdsaWRlJylcbiAgICAgICAgICAgIC5hZGRDbGFzcyhjbGFzc2VzLmRpc2FibGVkKVxuICAgICAgICAgICAgLnNpYmxpbmdzKClcbiAgICAgICAgICAgIC5iaW5kKCdjbGljay5nbGlkZSB0b3VjaHN0YXJ0LmdsaWRlJywgdGhpcy5jbGljaylcbiAgICAgICAgICAgIC5iaW5kKCdtb3VzZWVudGVyLmdsaWRlJywgdGhpcy5ob3ZlcilcbiAgICAgICAgICAgIC5iaW5kKCdtb3VzZWxlYXZlLmdsaWRlJywgdGhpcy5ob3ZlcilcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhjbGFzc2VzLmRpc2FibGVkKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGJvdGggYXJyb3dzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBBcnJvd3MucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmJpbmQoKTtcblxuICAgICAgICB0aGlzLml0ZW1zLnJlbW92ZUNsYXNzKEdsaWRlLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFycm93IGNsaWNrIGV2ZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBBcnJvd3MucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIUNvcmUuRXZlbnRzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICBDb3JlLlJ1bi5wYXVzZSgpO1xuICAgICAgICAgICAgQ29yZS5SdW4ubWFrZSgkKHRoaXMpLmRhdGEoJ2dsaWRlLWRpcicpKTtcbiAgICAgICAgICAgIENvcmUuQW5pbWF0aW9uLmFmdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIENvcmUuUnVuLnBsYXkoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFycm93cyBob3ZlciBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgQXJyb3dzLnByb3RvdHlwZS5ob3ZlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghQ29yZS5FdmVudHMuZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgYXV0b3BsYXkgb24gbW91c2UgbGVhdmUuXG4gICAgICAgICAgICAgICAgY2FzZSAnbW91c2VsZWF2ZSc6XG4gICAgICAgICAgICAgICAgICAgIENvcmUuUnVuLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gUGF1c2UgYXV0b3BsYXkgb24gbW91c2UgZW50ZXIuXG4gICAgICAgICAgICAgICAgY2FzZSAnbW91c2VlbnRlcic6XG4gICAgICAgICAgICAgICAgICAgIENvcmUuUnVuLnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQmluZCBhcnJvd3MgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBBcnJvd3MucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pdGVtc1xuICAgICAgICAgICAgLm9uKCdjbGljay5nbGlkZSB0b3VjaHN0YXJ0LmdsaWRlJywgdGhpcy5jbGljaylcbiAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5nbGlkZScsIHRoaXMuaG92ZXIpXG4gICAgICAgICAgICAub24oJ21vdXNlbGVhdmUuZ2xpZGUnLCB0aGlzLmhvdmVyKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmQgYXJyb3dzIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgQXJyb3dzLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pdGVtc1xuICAgICAgICAgICAgLm9mZignY2xpY2suZ2xpZGUgdG91Y2hzdGFydC5nbGlkZScpXG4gICAgICAgICAgICAub2ZmKCdtb3VzZWVudGVyLmdsaWRlJylcbiAgICAgICAgICAgIC5vZmYoJ21vdXNlbGVhdmUuZ2xpZGUnKTtcbiAgICB9O1xuXG5cbiAgICAvLyBSZXR1cm4gY2xhc3MuXG4gICAgcmV0dXJuIG5ldyBBcnJvd3MoKTtcblxufTtcbjsvKipcbiAqIEJ1aWxkIG1vZHVsZS5cbiAqXG4gKiBAcGFyYW0ge1t0eXBlXX0gR2xpZGVcbiAqIEBwYXJhbSB7W3R5cGVdfSBDb3JlXG4gKiBAcmV0dXJuIHtCdWlsZH1cbiAqL1xudmFyIEJ1aWxkID0gZnVuY3Rpb24oR2xpZGUsIENvcmUpIHtcblxuICAgIC8vIEJ1aWxkIGNvbnN0cnVjdG9yLlxuICAgIGZ1bmN0aW9uIEJ1aWxkKCkge1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0IHNsaWRlciBidWlsZGVyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBCdWlsZC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBCdWlsZCBwcm9wZXIgc2xpZGVyIHR5cGVcbiAgICAgICAgdGhpc1tHbGlkZS5vcHRpb25zLnR5cGVdKCk7XG5cbiAgICAgICAgLy8gU2V0IHNsaWRlIGFjdGl2ZSBjbGFzc1xuICAgICAgICB0aGlzLmFjdGl2ZSgpO1xuXG4gICAgICAgIC8vIFNldCBzbGlkZXMgaGVpZ2h0XG4gICAgICAgIENvcmUuSGVpZ2h0LnNldCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBzbGlkZXIgdHlwZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgQnVpbGQucHJvdG90eXBlLmlzVHlwZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIEdsaWRlLm9wdGlvbnMudHlwZSA9PT0gbmFtZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgc2xpZGVyIG1vZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIEJ1aWxkLnByb3RvdHlwZS5pc01vZGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBHbGlkZS5vcHRpb25zLm1vZGUgPT09IG5hbWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJ1aWxkIHNsaWRlciB0eXBlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBCdWlsZC5wcm90b3R5cGUuc2xpZGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gVHVybiBvbiBqdW1waW5nIGZsYWcuXG4gICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gdHJ1ZTtcblxuICAgICAgICAvLyBBcHBseSBzbGlkZXMgd2lkdGguXG4gICAgICAgIEdsaWRlLnNsaWRlc1tHbGlkZS5zaXplXShHbGlkZVtHbGlkZS5zaXplXSk7XG5cbiAgICAgICAgLy8gQXBwbHkgdHJhbnNsYXRlLlxuICAgICAgICBHbGlkZS50cmFjay5jc3MoR2xpZGUuc2l6ZSwgR2xpZGVbR2xpZGUuc2l6ZV0gKiBHbGlkZS5sZW5ndGgpO1xuXG4gICAgICAgIC8vIElmIG1vZGUgaXMgdmVydGljYWwgYXBwbHkgaGVpZ2h0LlxuICAgICAgICBpZiAodGhpcy5pc01vZGUoJ3ZlcnRpY2FsJykpIHtcbiAgICAgICAgICAgIENvcmUuSGVpZ2h0LnNldCh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdvIHRvIHN0YXJ0dXAgcG9zaXRpb24uXG4gICAgICAgIENvcmUuQW5pbWF0aW9uLm1ha2UoKTtcblxuICAgICAgICAvLyBUdXJuIG9mZiBqdW1waW5nIGZsYWcuXG4gICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQnVpbGQgY2Fyb3VzZWwgdHlwZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgQnVpbGQucHJvdG90eXBlLmNhcm91c2VsID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gVHVybiBvbiBqdW1waW5nIGZsYWcuXG4gICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gdHJ1ZTtcblxuICAgICAgICAvLyBVcGRhdGUgc2hpZnQgZm9yIGNhcnVzZWwgdHlwZS5cbiAgICAgICAgQ29yZS5DbG9uZXMuc2hpZnQgPSAoR2xpZGVbR2xpZGUuc2l6ZV0gKiBDb3JlLkNsb25lcy5pdGVtcy5sZW5ndGggLyAyKSAtIEdsaWRlW0dsaWRlLnNpemVdO1xuXG4gICAgICAgIC8vIEFwcGx5IHNsaWRlcyB3aWR0aC5cbiAgICAgICAgR2xpZGUuc2xpZGVzW0dsaWRlLnNpemVdKEdsaWRlW0dsaWRlLnNpemVdKTtcblxuICAgICAgICAvLyBBcHBseSB0cmFuc2xhdGUuXG4gICAgICAgIEdsaWRlLnRyYWNrLmNzcyhHbGlkZS5zaXplLCAoR2xpZGVbR2xpZGUuc2l6ZV0gKiBHbGlkZS5sZW5ndGgpICsgQ29yZS5DbG9uZXMuZ2V0R3Jvd3RoKCkpO1xuXG4gICAgICAgIC8vIElmIG1vZGUgaXMgdmVydGljYWwgYXBwbHkgaGVpZ2h0LlxuICAgICAgICBpZiAodGhpcy5pc01vZGUoJ3ZlcnRpY2FsJykpIHtcbiAgICAgICAgICAgIENvcmUuSGVpZ2h0LnNldCh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdvIHRvIHN0YXJ0dXAgcG9zaXRpb24uXG4gICAgICAgIENvcmUuQW5pbWF0aW9uLm1ha2UoKTtcblxuICAgICAgICAvLyBBcHBlbmQgY2xvbmVzLlxuICAgICAgICBDb3JlLkNsb25lcy5hcHBlbmQoKTtcblxuICAgICAgICAvLyBUdXJuIG9mZiBqdW1waW5nIGZsYWcuXG4gICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQnVpbGQgc2xpZGVzaG93IHR5cGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEJ1aWxkLnByb3RvdHlwZS5zbGlkZXNob3cgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAvLyBUdXJuIG9uIGp1bXBpbmcgZmxhZ1xuICAgICAgICBDb3JlLlRyYW5zaXRpb24uanVtcGluZyA9IHRydWU7XG5cbiAgICAgICAgLy8gR28gdG8gc3RhcnR1cCBwb3NpdGlvblxuICAgICAgICBDb3JlLkFuaW1hdGlvbi5tYWtlKCk7XG5cbiAgICAgICAgLy8gVHVybiBvZmYganVtcGluZyBmbGFnXG4gICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gZmFsc2U7XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0IGFjdGl2ZSBjbGFzcyB0byBjdXJyZW50IHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBCdWlsZC5wcm90b3R5cGUuYWN0aXZlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgR2xpZGUuc2xpZGVzXG4gICAgICAgICAgICAuZXEoR2xpZGUuY3VycmVudCAtIDEpLmFkZENsYXNzKEdsaWRlLm9wdGlvbnMuY2xhc3Nlcy5hY3RpdmUpXG4gICAgICAgICAgICAuc2libGluZ3MoKS5yZW1vdmVDbGFzcyhHbGlkZS5vcHRpb25zLmNsYXNzZXMuYWN0aXZlKTtcblxuICAgIH07XG5cbiAgICAvLyBSZXR1cm4gY2xhc3MuXG4gICAgcmV0dXJuIG5ldyBCdWlsZCgpO1xuXG59O1xuOy8qKlxuICogQnVsbGV0cyBtb2R1bGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0ge09iamVjdH0gQ29yZVxuICogQHJldHVybiB7QnVsbGV0c31cbiAqL1xudmFyIEJ1bGxldHMgPSBmdW5jdGlvbihHbGlkZSwgQ29yZSkge1xuXG4gICAgLyoqXG4gICAgICogQnVsbGV0cyBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBCdWxsZXRzKCkge1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdCBidWxsZXRzIGJ1aWxkZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIEJ1bGxldHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5idWlsZCgpO1xuICAgICAgICB0aGlzLmFjdGl2ZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgRE9NIGFuZCBzZXR1cCBidWxsZXRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBCdWxsZXRzLnByb3RvdHlwZS5idWlsZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIEdldCBidWxsZXRzIHdyYXBwZXIuXG4gICAgICAgIHRoaXMud3JhcHBlciA9IEdsaWRlLnNsaWRlci5jaGlsZHJlbignLicgKyBHbGlkZS5vcHRpb25zLmNsYXNzZXMuYnVsbGV0cyk7XG5cbiAgICAgICAgLy8gU2V0IGNsYXNzIGFuZCBkaXJlY3Rpb24gdG8gZWFjaCBidWxsZXQuXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IEdsaWRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAkKCc8YnV0dG9uPicsIHtcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiBHbGlkZS5vcHRpb25zLmNsYXNzZXMuYnVsbGV0LFxuICAgICAgICAgICAgICAgICdkYXRhLWdsaWRlLWRpcic6ICc9JyArIGlcbiAgICAgICAgICAgIH0pLmFwcGVuZFRvKHRoaXMud3JhcHBlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgYWxsIGJ1bGxldHMuXG4gICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLndyYXBwZXIuY2hpbGRyZW4oKTtcblxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgYWN0aXZlIGNsYXNzLiBBZGRpbmcgYW5kIHJlbW92aW5nIGFjdGl2ZSBjbGFzcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgQnVsbGV0cy5wcm90b3R5cGUuYWN0aXZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaXRlbXMuZXEoR2xpZGUuY3VycmVudCAtIDEpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBhbGwgYnVsbGV0cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgQnVsbGV0cy5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaXRlbXMucmVtb3ZlKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJ1bGxldCBjbGljayBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqL1xuICAgIEJ1bGxldHMucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIUNvcmUuRXZlbnRzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICBDb3JlLlJ1bi5wYXVzZSgpO1xuICAgICAgICAgICAgQ29yZS5SdW4ubWFrZSgkKHRoaXMpLmRhdGEoJ2dsaWRlLWRpcicpKTtcbiAgICAgICAgICAgIENvcmUuQW5pbWF0aW9uLmFmdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIENvcmUuUnVuLnBsYXkoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJ1bGxldHMgaG92ZXIgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEJ1bGxldHMucHJvdG90eXBlLmhvdmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCFDb3JlLkV2ZW50cy5kaXNhYmxlZCkge1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBTdGFydCBhdXRvcGxheSBvbiBtb3VzZSBsZWF2ZS5cbiAgICAgICAgICAgICAgICBjYXNlICdtb3VzZWxlYXZlJzpcbiAgICAgICAgICAgICAgICAgICAgQ29yZS5SdW4ucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvLyBQYXVzZSBhdXRvcGxheSBvbiBtb3VzZSBlbnRlci5cbiAgICAgICAgICAgICAgICBjYXNlICdtb3VzZWVudGVyJzpcbiAgICAgICAgICAgICAgICAgICAgQ29yZS5SdW4ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGJ1bGxldHMgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBCdWxsZXRzLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMud3JhcHBlclxuICAgICAgICAgICAgLm9uKCdjbGljay5nbGlkZSB0b3VjaHN0YXJ0LmdsaWRlJywgJ2J1dHRvbicsIHRoaXMuY2xpY2spXG4gICAgICAgICAgICAub24oJ21vdXNlZW50ZXIuZ2xpZGUnLCAnYnV0dG9uJywgdGhpcy5ob3ZlcilcbiAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZS5nbGlkZScsICdidXR0b24nLCB0aGlzLmhvdmVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGJ1bGxldHMgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBCdWxsZXRzLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy53cmFwcGVyXG4gICAgICAgICAgICAub2ZmKCdjbGljay5nbGlkZSB0b3VjaHN0YXJ0LmdsaWRlJywgJ2J1dHRvbicpXG4gICAgICAgICAgICAub2ZmKCdtb3VzZWVudGVyLmdsaWRlJywgJ2J1dHRvbicpXG4gICAgICAgICAgICAub2ZmKCdtb3VzZWxlYXZlLmdsaWRlJywgJ2J1dHRvbicpO1xuICAgIH07XG5cbiAgICAvLyBSZXR1cm4gY2xhc3MuXG4gICAgcmV0dXJuIG5ldyBCdWxsZXRzKCk7XG5cbn07XG47LyoqXG4gKiBDbG9uZXMgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtIHtPYmplY3R9IENvcmVcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKi9cbnZhciBDbG9uZXMgPSBmdW5jdGlvbihHbGlkZSwgQ29yZSkge1xuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIHBvc2l0aW9uIG1hcC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKi9cbiAgICB2YXIgbWFwID0gWzAsIDFdO1xuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIG9yZGVyIHBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgdmFyIHBhdHRlcm47XG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgY29uc3RydWN0b3IuXG4gICAgICovXG4gICAgZnVuY3Rpb24gQ2xvbmVzKCkge1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgICAgIHRoaXMuc2hpZnQgPSAwO1xuXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXQgY2xvbmVzIGJ1aWxkZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIENsb25lcy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIE1hcCBjbG9uZXMgb3JkZXIgcGF0dGVybi5cbiAgICAgICAgdGhpcy5tYXAoKTtcblxuICAgICAgICAvLyBDb2xsZWN0IHNsaWRlcyB0byBjbG9uZVxuICAgICAgICAvLyB3aXRoIGNyZWF0ZWQgcGF0dGVybi5cbiAgICAgICAgdGhpcy5jb2xsZWN0KCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgY2xvbmVzIHBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIENsb25lcy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICBwYXR0ZXJuID0gW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG1hcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGF0dGVybi5wdXNoKC0xIC0gaSwgaSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29sbGVjdCBjbG9uZXMgd2l0aCBwYXR0ZXJuLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBDbG9uZXMucHJvdG90eXBlLmNvbGxlY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGl0ZW07XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXR0ZXJuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpdGVtID0gR2xpZGUuc2xpZGVzLmVxKHBhdHRlcm5baV0pXG4gICAgICAgICAgICAgICAgLmNsb25lKCkuYWRkQ2xhc3MoR2xpZGUub3B0aW9ucy5jbGFzc2VzLmNsb25lKTtcblxuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBjbG9uZWQgc2xpZGVzIHdpdGggZ2VuZXJhdGVkIHBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIENsb25lcy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgaXRlbTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaXRlbSA9IHRoaXMuaXRlbXNbaV1bR2xpZGUuc2l6ZV0oR2xpZGVbR2xpZGUuc2l6ZV0pO1xuXG4gICAgICAgICAgICAvLyBBcHBlbmQgY2xvbmUgaWYgcGF0dGVybiBwb3NpdGlvbiBpcyBwb3NpdGl2ZS5cbiAgICAgICAgICAgIGlmIChwYXR0ZXJuW2ldID49IDApIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFwcGVuZFRvKEdsaWRlLnRyYWNrKTtcbiAgICAgICAgICAgIC8vIFByZXBlbmQgY2xvbmUgaWYgcGF0dGVybiBwb3NpdGlvbiBpcyBuZWdhdGl2ZS5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbS5wcmVwZW5kVG8oR2xpZGUudHJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgY2xvbmVkIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgQ2xvbmVzLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0ucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IHNpemUgZ3JvdyBjYXVzZWQgYnkgY2xvbmVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIENsb25lcy5wcm90b3R5cGUuZ2V0R3Jvd3RoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBHbGlkZS53aWR0aCAqIHRoaXMuaXRlbXMubGVuZ3RoO1xuICAgIH07XG5cbiAgICAvLyBSZXR1cm4gY2xhc3MuXG4gICAgcmV0dXJuIG5ldyBDbG9uZXMoKTtcblxufTtcbjsvKipcclxuICogR2xpZGUgY29yZS5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IEdsaWRlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBNb2R1bGVzXHJcbiAqIEByZXR1cm4ge0NvcmV9XHJcbiAqL1xyXG52YXIgQ29yZSA9IGZ1bmN0aW9uKEdsaWRlLCBNb2R1bGVzKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb3JlIGNvbnN0cnVjdG9yLiBDb25zdHJ1Y3QgbW9kdWxlcyBhbmRcclxuICAgICAqIGluamVjdCBHbGlkZSBhbmQgQ29yZSBhcyBkZXBlbmRlbmN5LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1ZvaWR9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIENvcmUoKSB7XHJcblxyXG4gICAgICAgIGZvciAodmFyIG1vZHVsZSBpbiBNb2R1bGVzKSB7XHJcbiAgICAgICAgICAgIHRoaXNbbW9kdWxlXSA9IG5ldyBNb2R1bGVzW21vZHVsZV0oR2xpZGUsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIGNsYXNzLlxyXG4gICAgcmV0dXJuIG5ldyBDb3JlKCk7XHJcblxyXG59O1xyXG47LyoqXG4gKiBFdmVudHMgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtIHtPYmplY3R9IENvcmVcbiAqIEByZXR1cm4ge0V2ZW50c31cbiAqL1xudmFyIEV2ZW50cyA9IGZ1bmN0aW9uKEdsaWRlLCBDb3JlKSB7XG5cbiAgICAvKipcbiAgICAgKiBDb2xsZWN0aW9uIG9mIHRyaWdnZXJzLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB2YXIgdHJpZ2dlcnMgPSAkKCdbZGF0YS1nbGlkZS10cmlnZ2VyXScpO1xuXG4gICAgLyoqXG4gICAgICogRXZlbnRzIGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMua2V5Ym9hcmQoKTtcbiAgICAgICAgdGhpcy5ob3ZlcnBhdXNlKCk7XG4gICAgICAgIHRoaXMucmVzaXplKCk7XG4gICAgICAgIHRoaXMuYmluZFRyaWdnZXJzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmluZCBrZXlib2FyZCBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEV2ZW50cy5wcm90b3R5cGUua2V5Ym9hcmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKEdsaWRlLm9wdGlvbnMua2V5Ym9hcmQpIHtcbiAgICAgICAgICAgICQod2luZG93KS5vbigna2V5dXAuZ2xpZGUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAzOSkge1xuICAgICAgICAgICAgICAgICAgICBDb3JlLlJ1bi5tYWtlKCc+Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAzNykge1xuICAgICAgICAgICAgICAgICAgICBDb3JlLlJ1bi5tYWtlKCc8Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQmluZCBob3ZlcnBhdXNlIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBFdmVudHMucHJvdG90eXBlLmhvdmVycGF1c2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAoR2xpZGUub3B0aW9ucy5ob3ZlcnBhdXNlKSB7XG5cbiAgICAgICAgICAgIEdsaWRlLnRyYWNrXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZW92ZXIuZ2xpZGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgQ29yZS5SdW4ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICAgICAgQ29yZS5FdmVudHMudHJpZ2dlcignbW91c2VPdmVyJyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlb3V0LmdsaWRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIENvcmUuUnVuLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgQ29yZS5FdmVudHMudHJpZ2dlcignbW91c2VPdXQnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQmluZCByZXNpemUgd2luZG93IGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBFdmVudHMucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplLmdsaWRlLicgKyBHbGlkZS51dWlkLCBDb3JlLkhlbHBlci50aHJvdHRsZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIEdsaWRlLnNldHVwKCk7XG4gICAgICAgICAgICBDb3JlLkJ1aWxkLmluaXQoKTtcbiAgICAgICAgICAgIENvcmUuUnVuLm1ha2UoJz0nICsgR2xpZGUuY3VycmVudCwgZmFsc2UpO1xuICAgICAgICAgICAgQ29yZS5SdW4ucGxheSgpO1xuICAgICAgICAgICAgQ29yZS5UcmFuc2l0aW9uLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfSwgR2xpZGUub3B0aW9ucy50aHJvdHRsZSkpO1xuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEJpbmQgdHJpZ2dlcnMgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBFdmVudHMucHJvdG90eXBlLmJpbmRUcmlnZ2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHJpZ2dlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0cmlnZ2Vyc1xuICAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLmdsaWRlIHRvdWNoc3RhcnQuZ2xpZGUnKVxuICAgICAgICAgICAgICAgIC5vbignY2xpY2suZ2xpZGUgdG91Y2hzdGFydC5nbGlkZScsIHRoaXMuaGFuZGxlVHJpZ2dlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGFuZGUgdHJpZ2dlciBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgRXZlbnRzLnByb3RvdHlwZS5oYW5kbGVUcmlnZ2VyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB2YXIgdGFyZ2V0cyA9ICQodGhpcykuZGF0YSgnZ2xpZGUtdHJpZ2dlcicpLnNwbGl0KFwiIFwiKTtcblxuICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGVsIGluIHRhcmdldHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCh0YXJnZXRzW2VsXSkuZGF0YSgnZ2xpZGVfYXBpJyk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmdvKCQodGhpcykuZGF0YSgnZ2xpZGUtZGlyJyksIHRoaXMuYWN0aXZlVHJpZ2dlcik7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnBsYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlIGFsbCBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIEV2ZW50cy5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIGFsbCBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIEV2ZW50cy5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0YWNoIGFuY2hvcnMgY2xpY2tzIGluc2lkZSB0cmFjay5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgRXZlbnRzLnByb3RvdHlwZS5kZXRhY2hDbGlja3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgR2xpZGUudHJhY2suZmluZCgnYScpLmVhY2goZnVuY3Rpb24oaSwgYSkge1xuICAgICAgICAgICAgJChhKS5hdHRyKCdkYXRhLWhyZWYnLCAkKGEpLmF0dHIoJ2hyZWYnKSkucmVtb3ZlQXR0cignaHJlZicpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuY2hvcnMgY2xpY2tzIGluc2lkZSB0cmFjay5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgRXZlbnRzLnByb3RvdHlwZS5hdHRhY2hDbGlja3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgR2xpZGUudHJhY2suZmluZCgnYScpLmVhY2goZnVuY3Rpb24oaSwgYSkge1xuICAgICAgICAgICAgJChhKS5hdHRyKCdocmVmJywgJChhKS5hdHRyKCdkYXRhLWhyZWYnKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQcmV2ZW50IGFuY2hvcnMgY2xpY2tzIGluc2lkZSB0cmFjay5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgRXZlbnRzLnByb3RvdHlwZS5wcmV2ZW50Q2xpY2tzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZW1vdmUnKSB7XG4gICAgICAgICAgICBHbGlkZS50cmFjay5vbmUoJ2NsaWNrJywgJ2EnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBDYWxsIGV2ZW50IGZ1bmN0aW9uIHdpdGggcGFyYW1ldGVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmNcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIEV2ZW50cy5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgICAgaWYgKChmdW5jICE9PSAndW5kZWZpbmVkJykgJiYgKHR5cGVvZiBmdW5jID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgICAgZnVuYyh0aGlzLmdldFBhcmFtcygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VyIGV2ZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7c2VsZn1cbiAgICAgKi9cbiAgICBFdmVudHMucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIEdsaWRlLnNsaWRlci50cmlnZ2VyKG5hbWUgKyBcIi5nbGlkZVwiLCBbdGhpcy5nZXRQYXJhbXMoKV0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFyYW1ldGVycyBmb3IgZXZlbnRzIGNhbGxiYWNrLlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIEV2ZW50cy5wcm90b3R5cGUuZ2V0UGFyYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbmRleDogR2xpZGUuY3VycmVudCxcbiAgICAgICAgICAgIGxlbmd0aDogR2xpZGUuc2xpZGVzLmxlbmd0aCxcbiAgICAgICAgICAgIGN1cnJlbnQ6IEdsaWRlLnNsaWRlcy5lcShHbGlkZS5jdXJyZW50IC0gMSksXG4gICAgICAgICAgICBzbGlkZXI6IEdsaWRlLnNsaWRlcixcbiAgICAgICAgICAgIHN3aXBlOiB7XG4gICAgICAgICAgICAgICAgZGlzdGFuY2U6IChDb3JlLlRvdWNoLmRpc3RhbmNlIHx8IDApXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogVW5iaW5kIGFsbCBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEV2ZW50cy5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgR2xpZGUudHJhY2tcbiAgICAgICAgICAgIC5vZmYoJ2tleXVwLmdsaWRlJylcbiAgICAgICAgICAgIC5vZmYoJ21vdXNlb3Zlci5nbGlkZScpXG4gICAgICAgICAgICAub2ZmKCdtb3VzZW91dC5nbGlkZScpO1xuXG4gICAgICAgIHRyaWdnZXJzXG4gICAgICAgICAgICAub2ZmKCdjbGljay5nbGlkZSB0b3VjaHN0YXJ0LmdsaWRlJyk7XG5cbiAgICAgICAgJCh3aW5kb3cpXG4gICAgICAgICAgICAub2ZmKCdrZXl1cC5nbGlkZScpXG4gICAgICAgICAgICAub2ZmKCdyZXNpemUuZ2xpZGUuJyArIEdsaWRlLl91aWQpO1xuXG4gICAgfTtcblxuICAgIC8vIFJldHVybiBjbGFzcy5cbiAgICByZXR1cm4gbmV3IEV2ZW50cygpO1xuXG59O1xuOy8qKlxuICogSGVpZ2h0IG1vZHVsZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBDb3JlXG4gKiBAcmV0dXJuIHtIZWlnaHR9XG4gKi9cbnZhciBIZWlnaHQgPSBmdW5jdGlvbihHbGlkZSwgQ29yZSkge1xuXG4gICAgLyoqXG4gICAgICogSGVpZ2h0IGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEhlaWdodCgpIHtcbiAgICAgICAgaWYgKEdsaWRlLm9wdGlvbnMuYXV0b2hlaWdodCkge1xuICAgICAgICAgICAgR2xpZGUud3JhcHBlci5jc3Moe1xuICAgICAgICAgICAgICAgICd0cmFuc2l0aW9uJzogQ29yZS5UcmFuc2l0aW9uLmdldCgnaGVpZ2h0JyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHNsaWRlIGhlaWdodC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBIZWlnaHQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gKEdsaWRlLmF4aXMgPT09ICd5JykgPyBHbGlkZS5wYWRkaW5ncyAqIDIgOiAwO1xuXG4gICAgICAgIHJldHVybiBHbGlkZS5zbGlkZXMuZXEoR2xpZGUuY3VycmVudCAtIDEpLmhlaWdodCgpICsgb2Zmc2V0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2xpZGVyIGhlaWdodC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gZm9yY2UgRm9yY2UgaGVpZ2h0IHNldHRpbmcgZXZlbiBpZiBvcHRpb24gaXMgdHVybiBvZmYuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBIZWlnaHQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICAgIHJldHVybiAoR2xpZGUub3B0aW9ucy5hdXRvaGVpZ2h0IHx8IGZvcmNlKSA/IEdsaWRlLndyYXBwZXIuaGVpZ2h0KHRoaXMuZ2V0KCkpIDogZmFsc2U7XG4gICAgfTtcblxuICAgIC8vIEByZXR1cm4gSGVpZ2h0XG4gICAgcmV0dXJuIG5ldyBIZWlnaHQoKTtcblxufTtcbjsvKipcbiAqIGhlbHBlciBtb2R1bGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0ge09iamVjdH0gQ29yZVxuICogQHJldHVybiB7SGVscGVyfVxuICovXG52YXIgSGVscGVyID0gZnVuY3Rpb24oR2xpZGUsIENvcmUpIHtcblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBIZWxwZXIoKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgc2xpZGVyIGF4aXMgaXMgdmVydGljYWwgKHkgYXhpcykgcmV0dXJuIHZlcnRpY2FsIHZhbHVlXG4gICAgICogZWxzZSBheGlzIGlzIGhvcml6b250YWwgKHggYXhpcykgc28gcmV0dXJuIGhvcml6b250YWwgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtNaXhlZH0gaFZhbHVlXG4gICAgICogQHBhcmFtICB7TWl4ZWR9IHZWYWx1ZVxuICAgICAqIEByZXR1cm4ge01peGVkfVxuICAgICAqL1xuICAgIEhlbHBlci5wcm90b3R5cGUuYnlBeGlzID0gZnVuY3Rpb24oaFZhbHVlLCB2VmFsdWUpIHtcbiAgICAgICAgaWYgKEdsaWRlLmF4aXMgPT09ICd5Jykge1xuICAgICAgICAgICAgcmV0dXJuIHZWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoVmFsdWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENhcGl0YWxpc2Ugc3RyaW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBzXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIEhlbHBlci5wcm90b3R5cGUuY2FwaXRhbGlzZSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGltZS5cbiAgICAgKlxuICAgICAqIEB2ZXJzaW9uIFVuZGVyc2NvcmUuanMgMS44LjNcbiAgICAgKiBAc291cmNlIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL1xuICAgICAqIEBjb3B5cmlnaHQgKGMpIDIwMDktMjAxNSBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9ycy4gVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgSGVscGVyLnByb3RvdHlwZS5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaHJvdHRsZS5cbiAgICAgKlxuICAgICAqIEB2ZXJzaW9uIFVuZGVyc2NvcmUuanMgMS44LjNcbiAgICAgKiBAc291cmNlIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL1xuICAgICAqIEBjb3B5cmlnaHQgKGMpIDIwMDktMjAxNSBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9ycy4gVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAgICAgKi9cbiAgICBIZWxwZXIucHJvdG90eXBlLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciBjb250ZXh0O1xuICAgICAgICB2YXIgYXJncztcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgICAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiB0aGF0Lm5vdygpO1xuICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gdGhhdC5ub3coKTtcbiAgICAgICAgICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRyYW5zaXRpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIEhlbHBlci5wcm90b3R5cGUucmVtb3ZlU3R5bGVzID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZWxlbWVudHNbaV0ucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBSZXR1cm4gY2xhc3MuXG4gICAgcmV0dXJuIG5ldyBIZWxwZXIoKTtcblxufTtcbjsvKipcbiAqIFJ1biBtb2R1bGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0ge09iamVjdH0gQ29yZVxuICogQHJldHVybiB7UnVufVxuICovXG52YXIgUnVuID0gZnVuY3Rpb24oR2xpZGUsIENvcmUpIHtcblxuICAgIC8qKlxuICAgICAqIFJ1biBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBSdW4oKSB7XG5cbiAgICAgICAgLy8gUnVubmluZyBmbGFnLiBJdCdzIGluIHVzZSB3aGVuIGF1dG9wbGF5IGlzIGRpc2FibGVkXG4gICAgICAgIC8vIHZpYSBvcHRpb25zLCBidXQgd2Ugd2FudCBzdGFydCBhdXRvcGxheSB2aWEgYXBpLlxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyBGbGFnIGZvciBvZmZjYW52YXMgYW5pbWF0aW9uIHRvIGNsb25lZCBzbGlkZXNcbiAgICAgICAgdGhpcy5mbGFnID0gZmFsc2U7XG5cbiAgICAgICAgLy8gU3RhcnQgcnVubmluZy5cbiAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0dXAgYW5kIHN0YXJ0IGF1dG9wbGF5IHJ1bi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0ludGVnZXIvVW5kZWZpbmVkfVxuICAgICAqL1xuICAgIFJ1bi5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICBpZiAoR2xpZGUub3B0aW9ucy5hdXRvcGxheSB8fCB0aGlzLnJ1bm5pbmcpIHtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmludGVydmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wYXVzZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1ha2UoJz4nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wbGF5KCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5nZXRJbnRlcnZhbCgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJ2YWw7XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IGF1dG9wbGF5IGludGVydmFsIGN1bmZpZ3VyZWQgb24gZWFjaCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBSdW4ucHJvdG90eXBlLmdldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludChHbGlkZS5zbGlkZXMuZXEoR2xpZGUuY3VycmVudCAtIDEpLmRhdGEoJ2dsaWRlLWF1dG9wbGF5JykpIHx8IEdsaWRlLm9wdGlvbnMuYXV0b3BsYXk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhc3VlIGF1dG9wbGF5IGFuaW1hdGlvbiBhbmQgY2xlYXIgaW50ZXJ2YWwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtJbnRlZ2VyL1VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBSdW4ucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKEdsaWRlLm9wdGlvbnMuYXV0b3BsYXkgfHwgdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbnRlcnZhbCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnZhbDtcblxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB3ZSBhcmUgb24gdGhlIGZpcnN0IHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBSdW4ucHJvdG90eXBlLmlzU3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEdsaWRlLmN1cnJlbnQgPT09IDE7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHdlIGFyZSBvbiB0aGUgbGFzdCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgUnVuLnByb3RvdHlwZS5pc0VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gR2xpZGUuY3VycmVudCA9PT0gR2xpZGUubGVuZ3RoO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB3ZSBhcmUgbWFraW5nIG9mZnNldCBydW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIFJ1bi5wcm90b3R5cGUuaXNPZmZzZXQgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxhZyAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gZGlyZWN0aW9uO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSdW4gbW92ZSBhbmltYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbW92ZSBDb2RlIGluIHBhdHRlcm4ge2RpcmVjdGlvbn17c3RlcHN9IGVxLiBcIj0zXCJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgUnVuLnByb3RvdHlwZS5tYWtlID0gZnVuY3Rpb24obW92ZSwgY2FsbGJhY2spIHtcblxuICAgICAgICAvLyBTdG9yZSBzY29wZS5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIC8vIEV4dHJhY3QgbW92ZSBkaXJlY3Rpb24uXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbW92ZS5zdWJzdHIoMCwgMSk7XG5cbiAgICAgICAgLy8gRXh0cmFjdCBtb3ZlIHN0ZXBzLlxuICAgICAgICB0aGlzLnN0ZXBzID0gKG1vdmUuc3Vic3RyKDEpKSA/IG1vdmUuc3Vic3RyKDEpIDogMDtcblxuICAgICAgICAvLyBTdG9wIGF1dG9wbGF5IHVudGlsIGhvdmVycGF1c2UgaXMgbm90IHNldC5cbiAgICAgICAgaWYgKCFHbGlkZS5vcHRpb25zLmhvdmVycGF1c2UpIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERpc2FibGUgZXZlbnRzIGFuZCBjYWxsIGJlZm9yZSB0cmFuc2l0aW9uIGNhbGxiYWNrLlxuICAgICAgICBpZiAoY2FsbGJhY2sgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBDb3JlLkV2ZW50cy5kaXNhYmxlKClcbiAgICAgICAgICAgICAgICAuY2FsbChHbGlkZS5vcHRpb25zLmJlZm9yZVRyYW5zaXRpb24pXG4gICAgICAgICAgICAgICAgLnRyaWdnZXIoJ2JlZm9yZVRyYW5zaXRpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJhc2VkIG9uIGRpcmVjdGlvbi5cbiAgICAgICAgc3dpdGNoICh0aGlzLmRpcmVjdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHdlIGF0IGxhc3Qgc2xpZGUgYW5kIG1vdmUgZm9yd2FyZCBhbmQgc3RlcHMgYXJlXG4gICAgICAgICAgICAgICAgLy8gbnVtYmVyLCBzZXQgZmxhZyBhbmQgY3VycmVudCBzbGlkZSB0byBmaXJzdC5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0VuZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIEdsaWRlLmN1cnJlbnQgPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHN0ZXBzIGlzIG5vdCBudW1iZXIsIGJ1dCAnPidcbiAgICAgICAgICAgICAgICAvLyBzY3JvbGwgc2xpZGVyIHRvIGVuZC5cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLnN0ZXBzID09PSAnPicpIHtcbiAgICAgICAgICAgICAgICAgICAgR2xpZGUuY3VycmVudCA9IEdsaWRlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGNoYW5nZSBub3JtYWxseS5cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgR2xpZGUuY3VycmVudCA9IEdsaWRlLmN1cnJlbnQgKyAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgLy8gV2hlbiB3ZSBhdCBmaXJzdCBzbGlkZSBhbmQgbW92ZSBiYWNrd2FyZCBhbmQgc3RlcHNcbiAgICAgICAgICAgICAgICAvLyBhcmUgbnVtYmVyLCBzZXQgZmxhZyBhbmQgY3VycmVudCBzbGlkZSB0byBsYXN0LlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU3RhcnQoKSkge1xuICAgICAgICAgICAgICAgICAgICBHbGlkZS5jdXJyZW50ID0gR2xpZGUubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHN0ZXBzIGlzIG5vdCBudW1iZXIsIGJ1dCAnPCdcbiAgICAgICAgICAgICAgICAvLyBzY3JvbGwgc2xpZGVyIHRvIHN0YXJ0LlxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc3RlcHMgPT09ICc8Jykge1xuICAgICAgICAgICAgICAgICAgICBHbGlkZS5jdXJyZW50ID0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGNoYW5nZSBub3JtYWxseS5cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgR2xpZGUuY3VycmVudCA9IEdsaWRlLmN1cnJlbnQgLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICAgICAgLy8gSnVtcCB0byBzcGVjaWZlZCBzbGlkZS5cbiAgICAgICAgICAgICAgICBHbGlkZS5jdXJyZW50ID0gcGFyc2VJbnQodGhpcy5zdGVwcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBzbGlkZXMgaGVpZ2h0LlxuICAgICAgICBDb3JlLkhlaWdodC5zZXQoKTtcblxuICAgICAgICAvLyBTZXQgYWN0aXZlIGJ1bGxldC5cbiAgICAgICAgQ29yZS5CdWxsZXRzLmFjdGl2ZSgpO1xuXG4gICAgICAgIC8vIFJ1biBhY3R1YWwgdHJhbnNsYXRlIGFuaW1hdGlvbi5cbiAgICAgICAgQ29yZS5BbmltYXRpb24ubWFrZSgpLmFmdGVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBTZXQgYWN0aXZlIGZsYWdzLlxuICAgICAgICAgICAgQ29yZS5CdWlsZC5hY3RpdmUoKTtcblxuICAgICAgICAgICAgLy8gRW5hYmxlIGV2ZW50cyBhbmQgY2FsbCBjYWxsYmFja3MuXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgQ29yZS5FdmVudHMuZW5hYmxlKClcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoY2FsbGJhY2spXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKEdsaWRlLm9wdGlvbnMuYWZ0ZXJUcmFuc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudHJpZ2dlcignYWZ0ZXJUcmFuc2l0aW9uJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN0YXJ0IGF1dG9wbGF5IHVudGlsIGhvdmVycGF1c2UgaXMgbm90IHNldC5cbiAgICAgICAgICAgIGlmICghR2xpZGUub3B0aW9ucy5ob3ZlcnBhdXNlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5wbGF5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVHJpZ2dlciBkdXJuaW5nIGFuaW1hdGlvbiBldmVudC5cbiAgICAgICAgQ29yZS5FdmVudHNcbiAgICAgICAgICAgIC5jYWxsKEdsaWRlLm9wdGlvbnMuZHVyaW5nVHJhbnNpdGlvbilcbiAgICAgICAgICAgIC50cmlnZ2VyKCdkdXJpbmdUcmFuc2l0aW9uJyk7XG5cbiAgICB9O1xuXG4gICAgLy8gUmV0dXJuIGNsYXNzLlxuICAgIHJldHVybiBuZXcgUnVuKCk7XG5cbn07XG47LyoqXHJcbiAqIFRvdWNoIG1vZHVsZS5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IEdsaWRlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBDb3JlXHJcbiAqIEByZXR1cm4ge1RvdWNofVxyXG4gKi9cclxudmFyIFRvdWNoID0gZnVuY3Rpb24oR2xpZGUsIENvcmUpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvdWNoIGV2ZW50IG9iamVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAdmFyIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIHZhciB0b3VjaDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvdWNoIGNvbnN0cnVjdG9yLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUb3VjaCgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBCaW5kIHRvdWNoIGV2ZW50LlxyXG4gICAgICAgIGlmIChHbGlkZS5vcHRpb25zLnRvdWNoRGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgR2xpZGUudHJhY2sub24oe1xyXG4gICAgICAgICAgICAgICAgJ3RvdWNoc3RhcnQuZ2xpZGUnOiAkLnByb3h5KHRoaXMuc3RhcnQsIHRoaXMpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQmluZCBtb3VzZSBkcmFnIGV2ZW50LlxyXG4gICAgICAgIGlmIChHbGlkZS5vcHRpb25zLmRyYWdEaXN0YW5jZSkge1xyXG4gICAgICAgICAgICBHbGlkZS50cmFjay5vbih7XHJcbiAgICAgICAgICAgICAgICAnbW91c2Vkb3duLmdsaWRlJzogJC5wcm94eSh0aGlzLnN0YXJ0LCB0aGlzKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5iaW5kIHRvdWNoIGV2ZW50cy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxyXG4gICAgICovXHJcbiAgICBUb3VjaC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgR2xpZGUudHJhY2tcclxuICAgICAgICAgICAgLm9mZigndG91Y2hzdGFydC5nbGlkZSBtb3VzZWRvd24uZ2xpZGUnKVxyXG4gICAgICAgICAgICAub2ZmKCd0b3VjaG1vdmUuZ2xpZGUgbW91c2Vtb3ZlLmdsaWRlJylcclxuICAgICAgICAgICAgLm9mZigndG91Y2hlbmQuZ2xpZGUgdG91Y2hjYW5jZWwuZ2xpZGUgbW91c2V1cC5nbGlkZSBtb3VzZWxlYXZlLmdsaWRlJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgdG91Y2ggZXZlbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XHJcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxyXG4gICAgICovXHJcbiAgICBUb3VjaC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cclxuICAgICAgICAvLyBFc2NhcGUgaWYgZXZlbnRzIGRpc2FibGVkXHJcbiAgICAgICAgLy8gb3IgYWxyZWFkeSBkcmFnZ2luZy5cclxuICAgICAgICBpZiAoIUNvcmUuRXZlbnRzLmRpc2FibGVkICYmICF0aGlzLmRyYWdnaW5nKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBTdG9yZSBldmVudC5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XHJcbiAgICAgICAgICAgICAgICB0b3VjaCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0b3VjaCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBUdXJuIG9mZiBqdW1waW5nIGZsYWcuXHJcbiAgICAgICAgICAgIENvcmUuVHJhbnNpdGlvbi5qdW1waW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCB0b3VjaCBzdGFydCBwb2ludHMuXHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hTdGFydFggPSBwYXJzZUludCh0b3VjaC5wYWdlWCk7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hTdGFydFkgPSBwYXJzZUludCh0b3VjaC5wYWdlWSk7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hTaW4gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIEdsaWRlLnRyYWNrLm9uKHtcclxuICAgICAgICAgICAgICAgICd0b3VjaG1vdmUuZ2xpZGUgbW91c2Vtb3ZlLmdsaWRlJzogQ29yZS5IZWxwZXIudGhyb3R0bGUoJC5wcm94eSh0aGlzLm1vdmUsIHRoaXMpLCBHbGlkZS5vcHRpb25zLnRocm90dGxlKSxcclxuICAgICAgICAgICAgICAgICd0b3VjaGVuZC5nbGlkZSB0b3VjaGNhbmNlbC5nbGlkZSBtb3VzZXVwLmdsaWRlIG1vdXNlbGVhdmUuZ2xpZGUnOiAkLnByb3h5KHRoaXMuZW5kLCB0aGlzKVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGFjaCBjbGlja3MgaW5zaWRlIHRyYWNrLlxyXG4gICAgICAgICAgICBDb3JlLkV2ZW50cy5kZXRhY2hDbGlja3MoKVxyXG4gICAgICAgICAgICAgICAgLmNhbGwoR2xpZGUub3B0aW9ucy5zd2lwZVN0YXJ0KVxyXG4gICAgICAgICAgICAgICAgLnRyaWdnZXIoJ3N3aXBlU3RhcnQnKTtcclxuICAgICAgICAgICAgLy8gUGF1c2UgaWYgYXV0b3BsYXkuXHJcbiAgICAgICAgICAgIENvcmUuUnVuLnBhdXNlKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG91Y2ggbW92ZSBldmVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50XHJcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxyXG4gICAgICovXHJcbiAgICBUb3VjaC5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG4gICAgICAgIC8vIEVzY2FwZSBpZiBldmVudHMgbm90IGRpc2FibGVkXHJcbiAgICAgICAgLy8gb3Igbm90IGRyYWdnaW5nLlxyXG4gICAgICAgIGlmICghQ29yZS5FdmVudHMuZGlzYWJsZWQgJiYgdGhpcy5kcmFnZ2luZykge1xyXG5cclxuICAgICAgICAgICAgLy8gU3RvcmUgZXZlbnQuXHJcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgdG91Y2ggPSBldmVudC5vcmlnaW5hbEV2ZW50O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG91Y2ggPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHN0YXJ0LCBlbmQgcG9pbnRzLlxyXG4gICAgICAgICAgICB2YXIgc3ViRXhTeCA9IHBhcnNlSW50KHRvdWNoLnBhZ2VYKSAtIHRoaXMudG91Y2hTdGFydFg7XHJcbiAgICAgICAgICAgIHZhciBzdWJFeVN5ID0gcGFyc2VJbnQodG91Y2gucGFnZVkpIC0gdGhpcy50b3VjaFN0YXJ0WTtcclxuICAgICAgICAgICAgLy8gQml0d2lzZSBzdWJFeFN4IHBvdy5cclxuICAgICAgICAgICAgdmFyIHBvd0VYID0gTWF0aC5hYnMoc3ViRXhTeCA8PCAyKTtcclxuICAgICAgICAgICAgLy8gQml0d2lzZSBzdWJFeVN5IHBvdy5cclxuICAgICAgICAgICAgdmFyIHBvd0VZID0gTWF0aC5hYnMoc3ViRXlTeSA8PCAyKTtcclxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBsZW5ndGggb2YgdGhlIGh5cG90ZW51c2Ugc2VnbWVudC5cclxuICAgICAgICAgICAgdmFyIHRvdWNoSHlwb3RlbnVzZSA9IE1hdGguc3FydChwb3dFWCArIHBvd0VZKTtcclxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBsZW5ndGggb2YgdGhlIGNhdGhldHVzIHNlZ21lbnQuXHJcbiAgICAgICAgICAgIHZhciB0b3VjaENhdGhldHVzID0gTWF0aC5zcXJ0KENvcmUuSGVscGVyLmJ5QXhpcyhwb3dFWSwgcG93RVgpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgc2luZSBvZiB0aGUgYW5nbGUuXHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hTaW4gPSBNYXRoLmFzaW4odG91Y2hDYXRoZXR1cyAvIHRvdWNoSHlwb3RlbnVzZSk7XHJcbiAgICAgICAgICAgIC8vIFNhdmUgZGlzdGFuY2UuXHJcbiAgICAgICAgICAgIHRoaXMuZGlzdGFuY2UgPSBDb3JlLkhlbHBlci5ieUF4aXMoXHJcbiAgICAgICAgICAgICAgICAodG91Y2gucGFnZVggLSB0aGlzLnRvdWNoU3RhcnRYKSxcclxuICAgICAgICAgICAgICAgICh0b3VjaC5wYWdlWSAtIHRoaXMudG91Y2hTdGFydFkpXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYWtlIG9mZnNldCBhbmltYXRpb24uXHJcbiAgICAgICAgICAgIC8vIFdoaWxlIGFuZ2xlIGlzIGxvd2VyIHRoYW4gNDUgZGVncmVlLlxyXG4gICAgICAgICAgICBpZiAoKHRoaXMudG91Y2hTaW4gKiAxODAgLyBNYXRoLlBJKSA8IDQ1KSB7XHJcbiAgICAgICAgICAgICAgICBDb3JlLkFuaW1hdGlvbi5tYWtlKENvcmUuSGVscGVyLmJ5QXhpcyhzdWJFeFN4LCBzdWJFeVN5KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgY2xpY2tzIGluc2lkZSB0cmFjay5cclxuICAgICAgICAgICAgQ29yZS5FdmVudHMucHJldmVudENsaWNrcyhldmVudClcclxuICAgICAgICAgICAgICAgIC5jYWxsKEdsaWRlLm9wdGlvbnMuc3dpcGVNb3ZlKVxyXG4gICAgICAgICAgICAgICAgLnRyaWdnZXIoJ3N3aXBlTW92ZScpO1xyXG5cclxuICAgICAgICAgICAgLy8gV2hpbGUgbW9kZSBpcyB2ZXJ0aWNhbCwgd2UgZG9uJ3Qgd2FudCB0byBibG9jayBzY3JvbGwgd2hlbiB3ZSByZWFjaCBzdGFydCBvciBlbmQgb2Ygc2xpZGVyXHJcbiAgICAgICAgICAgIC8vIEluIHRoYXQgY2FzZSB3ZSBuZWVkIHRvIGVzY2FwZSBiZWZvcmUgcHJldmVudGluZyBkZWZhdWx0IGV2ZW50LlxyXG4gICAgICAgICAgICBpZiAoQ29yZS5CdWlsZC5pc01vZGUoJ3ZlcnRpY2FsJykpIHtcclxuICAgICAgICAgICAgICAgIGlmIChDb3JlLlJ1bi5pc1N0YXJ0KCkgJiYgc3ViRXlTeSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoQ29yZS5SdW4uaXNFbmQoKSAmJiBzdWJFeVN5IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2hpbGUgYW5nbGUgaXMgbG93ZXIgdGhhbiA0NSBkZWdyZWUuXHJcbiAgICAgICAgICAgIGlmICgodGhpcy50b3VjaFNpbiAqIDE4MCAvIE1hdGguUEkpIDwgNDUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgcHJvcGFnYXRpb24uXHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgc2Nyb2xsaW5nLlxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIC8vIEFkZCBkcmFnZ2luZyBjbGFzcy5cclxuICAgICAgICAgICAgICAgIEdsaWRlLnRyYWNrLmFkZENsYXNzKEdsaWRlLm9wdGlvbnMuY2xhc3Nlcy5kcmFnZ2luZyk7XHJcbiAgICAgICAgICAgIC8vIEVsc2UgZXNjYXBlIGZyb20gZXZlbnQsIHdlIGRvbid0IHdhbnQgbW92ZSBzbGlkZXIuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb3VjaCBlbmQgZXZlbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHRvZG8gQ2hlY2sgZWRnZSBjYXNlcyBmb3Igc2xpZGVyIHR5cGVcclxuICAgICAqIEBwYXJhbSB7T25qZWN0fSBldmVudFxyXG4gICAgICovXHJcbiAgICBUb3VjaC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcbiAgICAgICAgLy8gRXNjYXBlIGlmIGV2ZW50cyBub3QgZGlzYWJsZWRcclxuICAgICAgICAvLyBvciBub3QgZHJhZ2dpbmcuXHJcbiAgICAgICAgaWYgKCFDb3JlLkV2ZW50cy5kaXNhYmxlZCAmJiB0aGlzLmRyYWdnaW5nKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgZGlzdGFuY2UgbGltaXRlci5cclxuICAgICAgICAgICAgdmFyIGRpc3RhbmNlTGltaXRlcjtcclxuXHJcbiAgICAgICAgICAgIC8vIFN0b3JlIGV2ZW50LlxyXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNldXAnIHx8IGV2ZW50LnR5cGUgPT09ICdtb3VzZWxlYXZlJykge1xyXG4gICAgICAgICAgICAgICAgdG91Y2ggPSBldmVudC5vcmlnaW5hbEV2ZW50O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG91Y2ggPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRvdWNoIGRpc3RhbmNlLlxyXG4gICAgICAgICAgICB2YXIgdG91Y2hEaXN0YW5jZSA9IENvcmUuSGVscGVyLmJ5QXhpcyhcclxuICAgICAgICAgICAgICAgICh0b3VjaC5wYWdlWCAtIHRoaXMudG91Y2hTdGFydFgpLFxyXG4gICAgICAgICAgICAgICAgKHRvdWNoLnBhZ2VZIC0gdGhpcy50b3VjaFN0YXJ0WSlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZWdyZWUuXHJcbiAgICAgICAgICAgIHZhciB0b3VjaERlZyA9IHRoaXMudG91Y2hTaW4gKiAxODAgLyBNYXRoLlBJO1xyXG5cclxuICAgICAgICAgICAgLy8gVHVybiBvZmYganVtcGluZyBmbGFnLlxyXG4gICAgICAgICAgICBDb3JlLlRyYW5zaXRpb24uanVtcGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgc2xpZGVyIHR5cGUgaXMgc2xpZGVyLlxyXG4gICAgICAgICAgICBpZiAoQ29yZS5CdWlsZC5pc1R5cGUoJ3NsaWRlcicpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUHJldmVudCBzbGlkZSB0byByaWdodCBvbiBmaXJzdCBpdGVtIChwcmV2KS5cclxuICAgICAgICAgICAgICAgIGlmIChDb3JlLlJ1bi5pc1N0YXJ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG91Y2hEaXN0YW5jZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG91Y2hEaXN0YW5jZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgc2xpZGUgdG8gbGVmdCBvbiBsYXN0IGl0ZW0gKG5leHQpLlxyXG4gICAgICAgICAgICAgICAgaWYgKENvcmUuUnVuLmlzRW5kKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG91Y2hEaXN0YW5jZSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG91Y2hEaXN0YW5jZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU3dpdGNoIGRpc3RhbmNlIGxpbWl0IGJhc2Ugb24gZXZlbnQgdHlwZS5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZXVwJyB8fCBldmVudC50eXBlID09PSAnbW91c2VsZWF2ZScpIHtcclxuICAgICAgICAgICAgICAgIGRpc3RhbmNlTGltaXRlciA9IEdsaWRlLm9wdGlvbnMuZHJhZ0Rpc3RhbmNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2VMaW1pdGVyID0gR2xpZGUub3B0aW9ucy50b3VjaERpc3RhbmNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBXaGlsZSB0b3VjaCBpcyBwb3NpdGl2ZSBhbmQgZ3JlYXRlciB0aGFuXHJcbiAgICAgICAgICAgIC8vIGRpc3RhbmNlIHNldCBpbiBvcHRpb25zIG1vdmUgYmFja3dhcmQuXHJcbiAgICAgICAgICAgIGlmICh0b3VjaERpc3RhbmNlID4gZGlzdGFuY2VMaW1pdGVyICYmIHRvdWNoRGVnIDwgNDUpIHtcclxuICAgICAgICAgICAgICAgIENvcmUuUnVuLm1ha2UoJzwnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBXaGlsZSB0b3VjaCBpcyBuZWdhdGl2ZSBhbmQgbG93ZXIgdGhhbiBuZWdhdGl2ZVxyXG4gICAgICAgICAgICAvLyBkaXN0YW5jZSBzZXQgaW4gb3B0aW9ucyBtb3ZlIGZvcndhcmQuXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRvdWNoRGlzdGFuY2UgPCAtZGlzdGFuY2VMaW1pdGVyICYmIHRvdWNoRGVnIDwgNDUpIHtcclxuICAgICAgICAgICAgICAgIENvcmUuUnVuLm1ha2UoJz4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBXaGlsZSBzd2lwZSBkb24ndCByZWFjaCBkaXN0YW5jZSBhcHBseSBwcmV2aW91cyB0cmFuc2Zvcm0uXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgQ29yZS5BbmltYXRpb24ubWFrZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZnRlciBhbmltYXRpb24uXHJcbiAgICAgICAgICAgIENvcmUuQW5pbWF0aW9uLmFmdGVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRW5hYmxlIGV2ZW50cy5cclxuICAgICAgICAgICAgICAgIENvcmUuRXZlbnRzLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgYXV0b3BsYXkgc3RhcnQgYXV0byBydW4uXHJcbiAgICAgICAgICAgICAgICBDb3JlLlJ1bi5wbGF5KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gVW5zZXQgZHJhZ2dpbmcgZmxhZy5cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gRGlzYWJsZSBvdGhlciBldmVudHMuXHJcbiAgICAgICAgICAgIENvcmUuRXZlbnRzLmF0dGFjaENsaWNrcygpXHJcbiAgICAgICAgICAgICAgICAuZGlzYWJsZSgpXHJcbiAgICAgICAgICAgICAgICAuY2FsbChHbGlkZS5vcHRpb25zLnN3aXBlRW5kKVxyXG4gICAgICAgICAgICAgICAgLnRyaWdnZXIoJ3N3aXBlRW5kJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgZHJhZ2dpbmcgY2xhc3MgYW5kIHVuYmluZCBldmVudHMuXHJcbiAgICAgICAgICAgIEdsaWRlLnRyYWNrXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoR2xpZGUub3B0aW9ucy5jbGFzc2VzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAgLm9mZigndG91Y2htb3ZlLmdsaWRlIG1vdXNlbW92ZS5nbGlkZScpXHJcbiAgICAgICAgICAgICAgICAub2ZmKCd0b3VjaGVuZC5nbGlkZSB0b3VjaGNhbmNlbC5nbGlkZSBtb3VzZXVwLmdsaWRlIG1vdXNlbGVhdmUuZ2xpZGUnKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gUmV0dXJuIGNsYXNzLlxyXG4gICAgcmV0dXJuIG5ldyBUb3VjaCgpO1xyXG5cclxufTtcclxuOy8qKlxuICogVHJhbnNpdGlvbiBtb2R1bGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0ge09iamVjdH0gQ29yZVxuICogQHJldHVybiB7VHJhbnNpdGlvbn1cbiAqL1xudmFyIFRyYW5zaXRpb24gPSBmdW5jdGlvbihHbGlkZSwgQ29yZSkge1xuXG4gICAgLyoqXG4gICAgICogVHJhbnNpdGlvbiBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBUcmFuc2l0aW9uKCkge1xuICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdHJhbnNpdGlvbiBzZXR0aW5ncy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBUcmFuc2l0aW9uLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgICBpZiAoIXRoaXMuanVtcGluZykge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5ICsgJyAnICsgR2xpZGUub3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbiArICdtcyAnICsgR2xpZGUub3B0aW9ucy5hbmltYXRpb25UaW1pbmdGdW5jO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY2xlYXIoJ2FsbCcpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDbGVhciB0cmFuc2l0aW9uIHNldHRpbmdzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIFRyYW5zaXRpb24ucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIHByb3BlcnR5ICsgJyAwbXMgJyArIEdsaWRlLm9wdGlvbnMuYW5pbWF0aW9uVGltaW5nRnVuYztcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJuIGNsYXNzLlxuICAgIHJldHVybiBuZXcgVHJhbnNpdGlvbigpO1xuXG59O1xuOy8qKlxuICogVHJhbnNsYXRlIG1vZHVsZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBDb3JlXG4gKiBAcmV0dXJuIHtUcmFuc2xhdGV9XG4gKi9cbnZhciBUcmFuc2xhdGUgPSBmdW5jdGlvbihHbGlkZSwgQ29yZSkge1xuXG4gICAgLyoqXG4gICAgICogVHJhbnNsYXRlIGF4ZXMgbWFwLlxuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB2YXIgYXhlcyA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMCxcbiAgICAgICAgejogMFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGUgVHJhbnNsYXRlIENvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gVHJhbnNsYXRlKCkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0cmFuc2xhdGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGF4aXNcbiAgICAgKiBAcGFyYW0gIHtJbnRlZ2VyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBUcmFuc2xhdGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGF4aXMsIHZhbHVlKSB7XG4gICAgICAgIGF4ZXNbYXhpc10gPSBwYXJzZUludCh2YWx1ZSk7XG5cbiAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUzZCgnICsgKC0xICogYXhlcy54KSArICdweCwgJyArICgtMSAqIGF4ZXMueSkgKyAncHgsICcgKyAoLTEgKiBheGVzLnopICsgJ3B4KSc7XG4gICAgfTtcblxuICAgIC8vIFJldHVybiBjbGFzcy5cbiAgICByZXR1cm4gbmV3IFRyYW5zbGF0ZSgpO1xuXG59O1xuOy8qKlxyXG4gKiBDb25zdHJ1Y3QgR2xpZGUuIEluaXRpYWxpemUgc2xpZGVyLCBleHRlbmRzXHJcbiAqIGRlZmF1bHRzIGFuZCByZXR1cm5pbmcgcHVibGljIGFwaS5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICovXHJcbnZhciBHbGlkZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmF1bHQgc2xpZGVyIG9wdGlvbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgdmFyIGRlZmF1bHRzID0ge1xyXG4gICAgICAgIGF1dG9wbGF5OiA0MDAwLFxyXG4gICAgICAgIHR5cGU6ICdjYXJvdXNlbCcsXHJcbiAgICAgICAgbW9kZTogJ2hvcml6b250YWwnLFxyXG4gICAgICAgIHN0YXJ0QXQ6IDEsXHJcbiAgICAgICAgaG92ZXJwYXVzZTogdHJ1ZSxcclxuICAgICAgICBrZXlib2FyZDogdHJ1ZSxcclxuICAgICAgICB0b3VjaERpc3RhbmNlOiA4MCxcclxuICAgICAgICBkcmFnRGlzdGFuY2U6IDEyMCxcclxuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogNDAwLFxyXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmM6ICdjdWJpYy1iZXppZXIoMC4xNjUsIDAuODQwLCAwLjQ0MCwgMS4wMDApJyxcclxuICAgICAgICB0aHJvdHRsZTogMTYsXHJcbiAgICAgICAgYXV0b2hlaWdodDogZmFsc2UsXHJcbiAgICAgICAgcGFkZGluZ3M6IDAsXHJcbiAgICAgICAgY2VudGVyZWQ6IHRydWUsXHJcbiAgICAgICAgY2xhc3Nlczoge1xyXG4gICAgICAgICAgICBiYXNlOiAnZ2xpZGUnLFxyXG4gICAgICAgICAgICB3cmFwcGVyOiAnZ2xpZGVfX3dyYXBwZXInLFxyXG4gICAgICAgICAgICB0cmFjazogJ2dsaWRlX190cmFjaycsXHJcbiAgICAgICAgICAgIHNsaWRlOiAnZ2xpZGVfX3NsaWRlJyxcclxuICAgICAgICAgICAgYXJyb3dzOiAnZ2xpZGVfX2Fycm93cycsXHJcbiAgICAgICAgICAgIGFycm93OiAnZ2xpZGVfX2Fycm93JyxcclxuICAgICAgICAgICAgYXJyb3dOZXh0OiAnbmV4dCcsXHJcbiAgICAgICAgICAgIGFycm93UHJldjogJ3ByZXYnLFxyXG4gICAgICAgICAgICBidWxsZXRzOiAnZ2xpZGVfX2J1bGxldHMnLFxyXG4gICAgICAgICAgICBidWxsZXQ6ICdnbGlkZV9fYnVsbGV0JyxcclxuICAgICAgICAgICAgY2xvbmU6ICdjbG9uZScsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogJ2FjdGl2ZScsXHJcbiAgICAgICAgICAgIGRyYWdnaW5nOiAnZHJhZ2dpbmcnLFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogJ2Rpc2FibGVkJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmVmb3JlSW5pdDogZnVuY3Rpb24oZXZlbnQpIHt9LFxyXG4gICAgICAgIGFmdGVySW5pdDogZnVuY3Rpb24oZXZlbnQpIHt9LFxyXG4gICAgICAgIGJlZm9yZVRyYW5zaXRpb246IGZ1bmN0aW9uKGV2ZW50KSB7fSxcclxuICAgICAgICBkdXJpbmdUcmFuc2l0aW9uOiBmdW5jdGlvbihldmVudCkge30sXHJcbiAgICAgICAgYWZ0ZXJUcmFuc2l0aW9uOiBmdW5jdGlvbihldmVudCkge30sXHJcbiAgICAgICAgc3dpcGVTdGFydDogZnVuY3Rpb24oZXZlbnQpIHt9LFxyXG4gICAgICAgIHN3aXBlRW5kOiBmdW5jdGlvbihldmVudCkge30sXHJcbiAgICAgICAgc3dpcGVNb3ZlOiBmdW5jdGlvbihldmVudCkge30sXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEV4dGVuZCBkZWZhdWx0cyB3aXRoXHJcbiAgICAvLyB0aGUgaW5pdCBvcHRpb25zLlxyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgc2xpZGVyIGluc3RhbmNlIGlkLlxyXG4gICAgdGhpcy51dWlkID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCk7XHJcblxyXG4gICAgLy8gU3RhcnQgYXQgc2xpZGUgbnVtYmVyIHNwZWNpZmVkIGluIG9wdGlvbnMuXHJcbiAgICB0aGlzLmN1cnJlbnQgPSBwYXJzZUludCh0aGlzLm9wdGlvbnMuc3RhcnRBdCk7XHJcblxyXG4gICAgLy8gU3RvcmUgbWFpbiBzbGlkZXIgRE9NIGVsZW1lbnQuXHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgIC8vIENvbGxlY3Qgc2xpZGVyIERPTSBhbmRcclxuICAgIC8vIGluaXQgc2xpZGVyIHNpemVzLlxyXG4gICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICB0aGlzLnNldHVwKCk7XHJcblxyXG4gICAgLy8gQ2FsbCBiZWZvcmUgaW5pdCBjYWxsYmFjay5cclxuICAgIHRoaXMub3B0aW9ucy5iZWZvcmVJbml0KHtcclxuICAgICAgICBpbmRleDogdGhpcy5jdXJyZW50LFxyXG4gICAgICAgIGxlbmd0aDogdGhpcy5zbGlkZXMubGVuZ3RoLFxyXG4gICAgICAgIGN1cnJlbnQ6IHRoaXMuc2xpZGVzLmVxKHRoaXMuY3VycmVudCAtIDEpLFxyXG4gICAgICAgIHNsaWRlcjogdGhpcy5zbGlkZXJcclxuICAgIH0pO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGNvcmUgd2l0aCBtb2R1bGVzLlxyXG4gICAgICpcclxuICAgICAqIEB0eXBlIHtDb3JlfVxyXG4gICAgICovXHJcbiAgICB2YXIgRW5naW5lID0gbmV3IENvcmUodGhpcywge1xyXG4gICAgICAgIEhlbHBlcjogSGVscGVyLFxyXG4gICAgICAgIFRyYW5zbGF0ZTogVHJhbnNsYXRlLFxyXG4gICAgICAgIFRyYW5zaXRpb246IFRyYW5zaXRpb24sXHJcbiAgICAgICAgUnVuOiBSdW4sXHJcbiAgICAgICAgQW5pbWF0aW9uOiBBbmltYXRpb24sXHJcbiAgICAgICAgQ2xvbmVzOiBDbG9uZXMsXHJcbiAgICAgICAgQXJyb3dzOiBBcnJvd3MsXHJcbiAgICAgICAgQnVsbGV0czogQnVsbGV0cyxcclxuICAgICAgICBIZWlnaHQ6IEhlaWdodCxcclxuICAgICAgICBCdWlsZDogQnVpbGQsXHJcbiAgICAgICAgRXZlbnRzOiBFdmVudHMsXHJcbiAgICAgICAgVG91Y2g6IFRvdWNoLFxyXG4gICAgICAgIEFwaTogQXBpXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDYWxsIGFmdGVyIGluaXQgY2FsbGJhY2suXHJcbiAgICBFbmdpbmUuRXZlbnRzLmNhbGwodGhpcy5vcHRpb25zLmFmdGVySW5pdCk7XHJcblxyXG4gICAgLy8gUmV0dXJuIHNsaWRlciBBcGkuXHJcbiAgICByZXR1cm4gRW5naW5lLkFwaS5pbnN0YW5jZSgpO1xyXG5cclxufTtcclxuXHJcblxyXG4vKipcclxuICogQ29sbGVjdCBET00gYW5kIHNldCBjbGFzc2VzLlxyXG4gKlxyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cclxuR2xpZGUucHJvdG90eXBlLmNvbGxlY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG4gICAgdmFyIGNsYXNzZXMgPSBvcHRpb25zLmNsYXNzZXM7XHJcblxyXG4gICAgdGhpcy5zbGlkZXIgPSB0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoY2xhc3Nlcy5iYXNlICsgJy0tJyArIG9wdGlvbnMudHlwZSkuYWRkQ2xhc3MoY2xhc3Nlcy5iYXNlICsgJy0tJyArIG9wdGlvbnMubW9kZSk7XHJcbiAgICB0aGlzLnRyYWNrID0gdGhpcy5zbGlkZXIuZmluZCgnLicgKyBjbGFzc2VzLnRyYWNrKTtcclxuICAgIHRoaXMud3JhcHBlciA9IHRoaXMuc2xpZGVyLmZpbmQoJy4nICsgY2xhc3Nlcy53cmFwcGVyKTtcclxuICAgIHRoaXMuc2xpZGVzID0gdGhpcy50cmFjay5maW5kKCcuJyArIGNsYXNzZXMuc2xpZGUpLm5vdCgnLicgKyBjbGFzc2VzLmNsb25lKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogU2V0dXAgc2xpZGVyIGRlbWVudGlvbnMuXHJcbiAqXHJcbiAqIEByZXR1cm4ge1ZvaWR9XHJcbiAqL1xyXG5HbGlkZS5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1vZGUgdG8gZGltZW50aW9ucyAoc2l6ZSBhbmQgYXhpcykgbWFwcGVyLlxyXG4gICAgICpcclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIHZhciBtb2RlVG9EaW1lbnNpb25zTWFwID0ge1xyXG4gICAgICAgIGhvcml6b250YWw6IFsnd2lkdGgnLCAneCddLFxyXG4gICAgICAgIHZlcnRpY2FsOiBbJ2hlaWdodCcsICd5J10sXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdldCBzbGlkZXIgc2l6ZSBieSBhY3RpdmUgbW9kZS5cclxuICAgIHRoaXMuc2l6ZSA9IG1vZGVUb0RpbWVuc2lvbnNNYXBbdGhpcy5vcHRpb25zLm1vZGVdWzBdO1xyXG5cclxuICAgIC8vIEdldCBzbGlkZXIgYXhpcyBieSBhY3RpdmUgbW9kZS5cclxuICAgIHRoaXMuYXhpcyA9IG1vZGVUb0RpbWVuc2lvbnNNYXBbdGhpcy5vcHRpb25zLm1vZGVdWzFdO1xyXG5cclxuICAgIC8vIEdldCBzbGlkZXIgaXRlbXMgbGVuZ3RoLlxyXG4gICAgdGhpcy5sZW5ndGggPSB0aGlzLnNsaWRlcy5sZW5ndGg7XHJcblxyXG4gICAgLy8gR2V0IHNsaWRlciBjb25maWd1cmVkIHBhZGRpbmdzLlxyXG4gICAgdGhpcy5wYWRkaW5ncyA9IHRoaXMuZ2V0UGFkZGluZ3MoKTtcclxuXHJcbiAgICAvLyBTZXQgc2xpZGVyIHNpemUuXHJcbiAgICB0aGlzW3RoaXMuc2l6ZV0gPSB0aGlzLmdldFNpemUoKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogTm9ybWFsaXplIHBhZGRpbmdzIG9wdGlvbiB2YWx1ZS4gUGFyc2luZ1xyXG4gKiBzdHJpbmdzIHByb2NlbnRzLCBwaXhlbHMgYW5kIG51bWJlcnMuXHJcbiAqXHJcbiAqIEByZXR1cm4ge3N0cmluZ30gTm9ybWFsaXplZCB2YWx1ZVxyXG4gKi9cclxuR2xpZGUucHJvdG90eXBlLmdldFBhZGRpbmdzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIG9wdGlvbiA9IHRoaXMub3B0aW9ucy5wYWRkaW5ncztcclxuXHJcbiAgICAvLyBJZiB3ZSBoYXZlIGEgc3RyaW5nLCB3ZSBuZWVkXHJcbiAgICAvLyB0byBwYXJzZSBpdCB0byByZWFsIG51bWJlci5cclxuICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnc3RyaW5nJykge1xyXG5cclxuICAgICAgICAvLyBQYXJzZSBzdHJpbmcgdG8gaW50LlxyXG4gICAgICAgIHZhciBub3JtYWxpemVkID0gcGFyc2VJbnQob3B0aW9uLCAxMCk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIHN0cmluZyBpcyBwcm9jZW50YWdlIG51bWJlci5cclxuICAgICAgICB2YXIgaXNQZXJjZW50YWdlID0gb3B0aW9uLmluZGV4T2YoJyUnKSA+PSAwO1xyXG5cclxuICAgICAgICAvLyBJZiBwYWRkaW5ncyB2YWx1ZSBpcyBwcm9jZW50YWdlLiBDYWxjdWxhdGVcclxuICAgICAgICAvLyByZWFsIG51bWJlciB2YWx1ZSBmcm9tIHNsaWRlciBlbGVtZW50LlxyXG4gICAgICAgIGlmIChpc1BlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuc2xpZGVyW3RoaXMuc2l6ZV0oKSAqIChub3JtYWxpemVkIC8gMTAwKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWYWx1ZSBpcyBudW1iZXIgYXMgc3RyaW5nLCBzb1xyXG4gICAgICAgIC8vIGp1c3QgcmV0dXJuIG5vcm1hbGl6ZWQuXHJcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVmFsdWUgaXMgbnVtYmVyLCB3ZSBkb24ndCBuZWVkXHJcbiAgICAvLyB0byBkbyBhbnl0aGluZywgcmV0dXJuLlxyXG4gICAgcmV0dXJuIG9wdGlvbjtcclxuXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEdldCBzbGlkZXIgc2l6ZSB3aWR0aCB1cGRhdGVkXHJcbiAqIGJ5IGFkZHRpb25hbCBwYWRkaW5ncy5cclxuICpcclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cclxuR2xpZGUucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnNsaWRlclt0aGlzLnNpemVdKCkgLSAodGhpcy5wYWRkaW5ncyAqIDIpO1xyXG59O1xyXG47LyoqXG4gKiBXaXJlIEdsaWRlIHRvIHRoZSBqUXVlcnkuXG4gKlxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cblxuJC5mbi5nbGlkZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghJC5kYXRhKHRoaXMsICdnbGlkZV9hcGknKSkge1xuICAgICAgICAgICAgJC5kYXRhKHRoaXMsICdnbGlkZV9hcGknLFxuICAgICAgICAgICAgICAgIG5ldyBHbGlkZSgkKHRoaXMpLCBvcHRpb25zKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59O1xuXHJcbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7Il0sImZpbGUiOiJnbGlkZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
