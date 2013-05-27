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

(function ($) {
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
            
            var tagId = $(element).uniqueId().attr("id");
            tree.push(tagName + '[id="' + tagId + '"]');
        }
        
        return tree;
    }

    function startsWith(original, search) {
        return original.indexOf(search) == 0;
    }

    function endsWith(original, search) {
        return original.lastIndexOf(search) == original.length - search.length;
    }
    
    $.fn.analytics = function (options) {
        if ($(this).length == 0) {
            return;
        }

        // Configure the default settings.
        var settings = $.extend({
            attributes: [],
            assignTo: ["a", "input[type='submit']"],
            url: null,
            client: null
        }, options);

        return this.each(function () {
            var $elements = $(this).find(settings.assignTo.join(","));
            $elements.each(function () {
                // Assign identification to all relevant elements.
                walkTree($(this));
            })
            .click(function (e) {
                $this = $(this);

                if (settings.url) {
                    // We prevent the default action to allow the background call to succeed.
                    e.preventDefault();

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
                        if (startsWith(attribute, "analytics")) {
                            var cleanName = attribute.replace(/analytics/g, '').toLowerCase();
                            data[cleanName] = dataAttributes[attribute];
                        }
                    }

                    // Assign the custom attributes requested to be collected.
                    $.each($(settings.attributes), function (i, attribute) {
                        data[attribute] = $this.attr(attribute);
                    });

                    $.ajax({
                        type: "POST",
                        url: settings.url,
                        contentType: "application/x-www-form-urlencoded",
                        data: data
                    })
                    .done(function () {})
                    .fail(function () {})
                    .always(function () {
                        // TODO: Continue with the default action.
                    });
                }
            });
        });
    };
})(jQuery);