/*!
 * Dependent Dropdown Polish Translations
 *
 * This file must be loaded after 'dependent-dropdown.js'. Patterns in braces '{}', or
 * any HTML markup tags in the messages must not be converted or translated.
 *
 * NOTE: this file must be saved in UTF-8 encoding.
 */
(function ($) {
    "use strict";

    $.fn.dependent.DEFAULTS = $.extend(true, {}, $.fn.dependent.DEFAULTS, {
        placeholder: 'Wybierz...',
        loadingText: 'Ładowanie...',
        emptyText: 'Brak danych'
    });
})(window.jQuery);