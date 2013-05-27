// The MIT License (MIT)
//
// Copyright (c) <year> <copyright holders>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Check to see if a string starts with the given search criteria.
// @param {String} search
// @return {Boolean} a value indicating whether the string starts with the search criteria
String.prototype.startsWith = function (search) {
    return this.indexOf(search) == 0;
};

// Check to see if a string ends with the given search criteria.
// @param {String} search
// @return {Boolean} a value indicating whether the string ends with the search criteria
String.prototype.endsWith = function (search) {
    return original.lastIndexOf(search) == original.length - search.length;
};

(function ($) {
    // Declared outside of scope to maintain an accurate count.
    var uniqueId = 0;

    // Provide a unique identifier to an element if one has not already been assigned.
    // @return {Object} modified jQuery objects
    $.fn.analyticsUniqueId = function () {
        if (this.length == 0) {
            return;
        }

        return this.each(function () {
            if (!$(this).attr("id")) {
                $(this).attr("id", "analytics-id-" + ++uniqueId);
            }
        });
    };
})(jQuery);

(function ($) {
    // Default settings which may be extended upon.
    var settings = {
        attributes: [],
        assignTo: ["a", "input[type='submit']"],
        url: null,
        client: null
    };

    // Walk the tree of a given node.
    // @param {Object} element
    // @return {Array} path
    function walkTree(element) {
        var tree = [];
        var tagName = $(element).prop("tagName");
        
        if (tagName != undefined) {
            var parent = $(element).parent();
            if (parent != undefined) {
                $.each(walkTree($(element).parent()), function (i, node) {
                    tree.push(node);
                });
            }
            
            var tagId = $(element).analyticsUniqueId().attr("id");
            tree.push(tagName + '[id="' + tagId + '"]');
        }
        
        return tree;
    };

    // Identify the path to the node.
    // @param {Object} node
    function identifyPath(node) {
        // Assign identification to all relevant elements.
        walkTree(node);
    };

    // Initiate a trace on click.
    // @param {Object} e
    function initiateTrace(e) {
        // Locally scope this variable.
        $this = $(this);

        if (settings.url && !$this.is(".analytics-captured")) {
            // // We prevent the default action to allow the background call to succeed.
            // e.preventDefault();

            // Initialize the data to be collected.
            var data = {
                id: walkTree($this).join('.')
            };

            // Attach the client identifier if found.
            if (settings.client) {
                data["client"] = settings.client
            }

            // Assign any "data-analytics-" attributes.
            var dataAttributes = $this.data();
            for (var attribute in dataAttributes) {
                if (attribute.startsWith("analytics")) {
                    var cleanName = attribute.replace(/analytics/g, '').toLowerCase();
                    data[cleanName] = dataAttributes[attribute];
                }
            }

            // Assign the custom attributes requested to be collected.
            $.each($(settings.attributes), function (i, attribute) {
                data[attribute] = $this.attr(attribute);
            });

            // Send the analytics.
            $.ajax({
                type: "POST",
                url: settings.url,
                contentType: "application/x-www-form-urlencoded",
                data: data
            })
            .always(function () {
                $this.addClass("analytics-captured");
            });
        }
    };
    
    // Plug-in function providing easy access to analytics.
    // @param {Object} options
    // @returns {Object} modified jQuery objects
    $.fn.analytics = function (options) {
        if ($(this).length == 0) {
            return;
        }

        // Configure the default settings.
        settings = $.extend({}, settings, options);

        // Declare the selector to be used.
        var selector = settings.assignTo.join(",");

        return this.each(function () {
            // Itereate through all elements given on initiation.
            $(this).find(selector).andSelf().filter(selector)
            .each(function () {
                identifyPath($(this));
                $(this).on("click", initiateTrace);
            });
        })
        .on("DOMNodeInserted", function (e) {
            // This will capture any dynamically generated content.
            $(e.target).find(selector).andSelf().filter(selector)
            .each(function () {
                identifyPath($(this));
                $(this).on("click", initiateTrace);
            });
        });
    };
})(jQuery);