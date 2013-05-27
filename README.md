jquery-analytics
================

Description
-----------

jQuery plug-in to provide custom analytics. For those of us who can not use Google Analytics at work or just want to dork with something else.

Easy to use
-----------

With just a few lines of code you can easily configure your own web page analytics. Just specify the URI you would like to communicate with
and everything is a go. 

```javascript
$(function () {
	$(".trace").analytics({
		url: "http://localhost/trace"
	});
});
```

Custom tags supported out-of-the-box
------------------------------------

Often you want to track more meaningful information along with what is provided. Simply apply any number of custom attributes prefixed with **"data-analytics-"** and we will take care of the rest!

```html
<a id="myLink" href="#" data-analytics-outfit="pajamas" data-analytics-shoes="slippers">My link</a>
```

This will send the following information back:

```json
{
	id: "myLink",
	outfit: "pajamas",
	shoes: "slippers"
}
```

Determining the flow
--------------------

It is also possible to track the flow a user goes through while visiting your page if you have an uniquely identifier piece of information. This can be done during initialization as such:

```javascript
$(function () {
	$(".trace").analytics({
		url: "http://localhost/trace",
		client: "unique identifier"
	});
});
```