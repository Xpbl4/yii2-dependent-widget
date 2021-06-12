(function($){
    "use strict";

    var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];

    function DependentBind() {
        var self = this;
        var $element  = this.$element;
        var options   = this.options;

        if (!$.isEmptyObject(options.depends)) {
            for (var idx in options.depends) {
                if (options.depends.hasOwnProperty(idx)) {
                    var _item = options.depends[idx];

                    $('#' + _item)
                        .on(options.trigger, function (e) {
                            var $item = $(this);

                            $element.trigger($.Event('dependent:change', {relatedTarget: this}));
                            //options.page = 1;
                            self.update();
                        }).on('focus', function (e) {
                            var $item = $(this);

                            if (options.ajaxOptions.delay !== false && self._queryTimeout) window.clearTimeout(self._queryTimeout);

                            $element.trigger($.Event('dependent:focus', {relatedTarget: this}));
                        });
                }
            }
        }
    }

    function processResults (data, params) {
        params.page = params.page || 1;

        let loadMore = false;
        if (data.limit && data.total > 0) {
            loadMore = (data.limit * params.page < data.total);
        }

        return { results: data.output, pagination: { more: loadMore } }
    }

    function dataDepends (params) {
        var options = this.options;
        var $element = this.$element;
        var _thisParams = {
            params: this.getParams(options.params),
            depends: this.getParams(options.depends),
            selected: $element.val()
        };
        if (options.pagination && options.pagination instanceof Object)
            $.extend(true, _thisParams, options.pagination);

        $.extend(true, _thisParams, params);

        return _thisParams;
    }

    function loadMore() {
        var self = this;
        var options = this.options;
        var $element = this.$element;
        //More then ' + this.data.total + ' results can be loaded...
        $element.append($('<option value="dependent-more">' + options.moreText + '</option>'));
        $($element).on('change', function (e) {
            var $item = $(this);
            if ($item.val() === 'dependent-more') {
                e && e.preventDefault();
                e && e.stopPropagation();

                ++options.page;
                self.request();
            }
        });
    }

    // PUBLIC CLASS DEFINITION
    // =======================

    var DependentDropdown = function (element, options) {
        this.$element  = $(element);
        this.data      = null;
        this.options   = this.getOptions(options);
        this.isLoading = false;
        this._queryTimeout = false;

        this.$element.on('dependent:init', $.proxy(DependentBind, this));
        setTimeout($.proxy(function () {
            this.$element.trigger('dependent:init');
        }, this), 0);

        if (this.options.initialize === true) this.update();
    };

    DependentDropdown.DEFAULTS = {
        placeholder: 'Select...',
        loadingText: 'Loading...',
        emptyText: 'No data found...',
        moreText: 'Load more...',

        disabledClass: 'disabled',
        loadingClass: 'dependent-loading',
        errorClass: 'dependent-error',

        language: 'en',
        url: '',
        data: {},
        params: {},
        depends: {},

        ajaxOptions: {
            type: 'post',
            delay: false,
        },

        initialize: false,
        trigger: 'change',
        //page: 1,
        pagination: {
            limit: 20
        },

        plugin: false,
        pluginOptions: false,

        idParam: 'id',
        nameParam: 'name',
        optionsParam: 'options',
        assocParam: false,
        dependParam: 'depends',
        otherParam: 'params',
        allParam: 'depdrop_all_params'
    };

    DependentDropdown.prototype.getDefaults = function () {
        return DependentDropdown.DEFAULTS
    };

    DependentDropdown.prototype.setDefaults = function (options) {
        DependentDropdown.DEFAULTS = $.extend({}, this.getDefaults(), options)
    };

    DependentDropdown.prototype.getOptions = function (options) {
        var dataAttributes = this.$element.data();

        for (var dataAttr in dataAttributes) {
            if (dataAttributes.hasOwnProperty(dataAttr) && $.inArray(dataAttr, DISALLOWED_ATTRIBUTES) !== -1) {
                delete dataAttributes[dataAttr]
            }
        }

        options = $.extend({}, this.getDefaults(), dataAttributes, options);

        return options;
    };

    DependentDropdown.prototype.getSelected = function () {
        var $element = this.$element;
        var data = [];
        $('option:selected', $element).each(function (idx, item) {
            var id = $(item).val() || null;
            if (id !== null) data.push(id);
        });

        return data;
    };

    DependentDropdown.prototype.getParams = function (params) {
        var data = {};
        var id, value;

        if (!$.isEmptyObject(params)) {
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    value = params[key];
                    if ($('#' + value).length) {
                        id = value;
                        value = $('#' + id).val();
                    }

                    if (isNaN(key)) id = key;

                    data[id] = value;
                }
            }
        }

        return data;
    };

    DependentDropdown.prototype.requestPlugin = function (url, data) {
        var options = this.options;
        var $element = this.$element;

        var select2Options = $.extend(true, {}, options.select2Options, {
            ajax: {
                url: url,
                dataType: 'json',
                data: data,
                delay: options.ajaxOptions.delay || 0,
                processResults: $.proxy(processResults, this),
                cache: true
            }
        });
        $element.select2(select2Options);
    };

    DependentDropdown.prototype.request = function (url, data) {
        var options = this.options;
        var $element = this.$element;

        if (options.ajaxOptions.delay !== false && this._queryTimeout) window.clearTimeout(this._queryTimeout);
        this._queryTimeout = window.setTimeout($.proxy(function () {
            var self = this;
            var ajaxOptions = {
                url: url,
                data: data(),
                dataType: 'json',
                beforeSend: function (jqXHR, settings) {
                    var e;
                    $element.trigger(e = $.Event('dependent:beforeSend'), [jqXHR, settings]);
                    if (e.isDefaultPrevented()) return;

                    if (!options.page) options.page = 1;
                    self.setState('loading');
                },
                success: function (data, textStatus, jqXHR) {
                    $element.trigger('dependent:success', [data, textStatus, jqXHR]);

                    self.data = data;
                    if (!$.isEmptyObject(data) && data.total > 0) {
                        var selected = data.selected || null;
                        var result = processResults(data, options);

                        self.renderSelect(result, selected);
                        self.setState('done');
                    } else self.setState('empty');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $element.trigger('dependent:error', [jqXHR, textStatus, errorThrown]);

                    self.setState('error');
                },
                complete: function (jqXHR, textStatus) {
                    $element.trigger('dependent:afterChange', [jqXHR, textStatus]);
                }
            };

            $.extend(true, ajaxOptions, options.ajaxOptions);
            //console.log(ajaxOptions);
            $.ajax(ajaxOptions);
        }, this), options.ajaxOptions.delay || 0);
    };

    DependentDropdown.prototype.renderOption = function (id, name, selected, options) {
        var element = new Option(name, id, false, !!selected);

        return $(element, options);
    };
    
    DependentDropdown.prototype.renderSelect = function (data, selected) {
        var self = this;
        var options = this.options;
        var $element = this.$element;

        if (options.page === 1) {
            $element.empty();
            if (options.placeholder !== false)
                $element.append(self.renderOption('', options.placeholder));
        }

        //console.log(data);

        if ($.isEmptyObject(data.results))
            data.results = {};

        $.each(data.results, function (idx, item) {
            if (item.hasOwnProperty('id')) {
                var isSelected = $.inArray(item.id, selected) !== -1;
                var $option = self.renderOption(item.id, item.name, isSelected, item.options || {});

                $element.append($option);
            } else {
                var $group = $('<optgroup>', {label: item.name || idx});
                $.each(data, function (idx, item) {
                    if (item.hasOwnProperty('id')) {
                        var isSelected = $.inArray(item.id, selected) !== -1;
                        var $option = self.renderOption(item.id, item.name, isSelected, item.options || {});

                        $group.append($option);
                    }
                });
                $element.append($group);
            }

            //console.log(idx, items);
        });
    };
    
    DependentDropdown.prototype.setState = function (state) {
        var self      = this;
        var options   = this.options;
        var d         = this.options.disabledClass;
        var l         = this.options.loadingClass;
        var e         = this.options.errorClass;
        var $element  = this.$element;
        var data = $element.data();

        if (data.resetText == null) $element.data('resetText', $element.val());

        // push to event loop to allow forms to submit
        setTimeout($.proxy(function () {
            switch (state) {
                case 'loading': {
                    this.isLoading = true;
                    $element.removeClass([d, l, e].join(' ')).addClass([d, l].join(' ')).attr(d, d).prop(d, true);
                    $element.append($('<option value="dependent-loading" selected>' + options[state + 'Text'] + '</option>'));
                } break;
                case 'more': {
                    this.isLoading = false;
                    $element.removeClass([d, l, e].join(' ')).removeAttr(d).prop(d, false);
                    $('option[value^="dependent-"]', $element).remove();
                    $.proxy(loadMore, self);
                } break;
                case 'empty': {
                    this.isLoading = false;
                    $element.removeClass([d, l, e].join(' ')).addClass(d).attr(d, d).prop(d, true);
                    $element.append($('<option value="dependent-empty" selected>' + this.options[state + 'Text'] + '</option>'));
                } break;
                case 'error': {
                    this.isLoading = false;
                    $('option[value^="dependent-"]', $element).remove();
                    $element.removeClass([d, l, e].join(' ')).addClass(e).removeAttr(d).prop(d, false)
                } break;
                default:
                    this.isLoading = false;
                    $('option[value^="dependent-"]', $element).remove();
                    $element.removeClass([d, l, e].join(' ')).removeAttr(d).prop(d, false)
            }
            this.state = state;
        }, this), 0)
    };

    DependentDropdown.prototype.update = function () {
        var options = this.options;
        var url = options.url;

        this.request(url, $.proxy(dataDepends, this));

        if (options.plugin !== false)
            this.requestPlugin(url, $.proxy(dataDepends, this));
    };

    // DEPENDENT PLUGIN DEFINITION
    // ========================

    function Plugin(option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('dependent');
            var options = typeof option == 'object' && option;

            if (!data) $this.data('dependent', (data = new DependentDropdown(this, options)));

            if (typeof option === 'string' && data[option])
                return data[option].apply(this, Array.prototype.slice.call( arguments, 1 ));
        });
    }


    var old = $.fn.dependent;

    $.fn.dependent             = Plugin;
    $.fn.dependent.Constructor = DependentDropdown;


    // DEPENDENT NO CONFLICT
    // ==================

    $.fn.dependent.noConflict = function () {
        $.fn.dependent = old;
        return this
    };

    // DEPENDENT DATA-API
    // ===============

    $(window).on('load', function () {
        $('[data-toggle="dependent"]').each(function () {
            var $dependent = $(this);
            Plugin.call($dependent, $dependent.data())
        })
    })
    // $('[data-toggle="dependent"]').dependent();

})( jQuery );