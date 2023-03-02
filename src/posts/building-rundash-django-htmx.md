---
tags:
  - posts
  - rundash
  - tech
date: 2022-08-29
title: Building RunDash - Django + HTMX
description: One of my guiding principles behind RunDash's tech stack is that it should be kept as simple as possible. It is meant to return to a simpler time in web development before single page applications or microservices. That isn't to say it isn't modern though. While RunDash is not technically a single page application, full page loads are rare. You will not find webpack or React or babel in the `packages.json`.
---
One of my guiding principles behind <a href="https://rundashapp.com/">RunDash</a>'s tech stack is that it should be kept as simple as possible. It is meant to return to a simpler time in web development before single page applications or microservices. That isn't to say it isn't modern though. While <a href="https://rundashapp.com/">RunDash</a> is not technically a single page application, full page loads are rare. You will not find webpack or React or babel in the `packages.json`. <!-- excerpt -->And while it isn't powered by a dozen microservices, it is powered by half a dozen Django apps (more if you count dependencies) in a monolith. Django + HTMX has been a powerful combination helping things get done quickly and easily.

[RunDash][3] has only five JS dependencies at the time of writing and three of them are bootstrap related. The other two are [ChartJS][2] and [HTMX][1].

There is nothing particularly special about the combination of Django + HTMX. You could likely pair HTMX with any full featured backend framework like Laravel or Rails or Express and get just as much done. This post is more about the zen of developing a modern web application without writing any JS, and for [RunDash][3] that means Django + HTMX.

Disclaimer: This is not intended to be a full Django + HTMX tutorial, but rather showing off how they are used in [RunDash][3]. Some examples below are off the top of my head and may not be fully functional code.

### HTMX
HTMX works by listening to events in the DOM and reacting to them by calling an API and swapping the response body (which is HTML) in place of a specified element. This sounds complicated, but a naive example might look like this:

```html
<button hx-get="/api/form/" hx-target="#form-container" hx-trigger="click">
  Load Form
</button>
<div id="form-container"></div>
```

In the above example, clicking the button would trigger a `GET` request to `/api/form/` and place the HTML from the response inside of `#form-container`. This is a simplified example. You could also do something more complex like submit an HTML form using a PATCH request to update some data:

```html
<form hx-patch="/api/users/123/">
  <input type="text" name="first_name" />
  <input type="text" name="last_name" />
  <button type="submit">Update</button>
</form>
```

### Django + HTMX
Things get interesting when you begin mixing Django templates with HTMX. All of a sudden, something complicated like server rendered infinite scroll is just a few lines of code away. The following example is nearly identical to how [RunDash][3]'s activity infinite scroll works:

```html
<!-- rendered by some initial page load view -->
<div id="activity-list" hx-trigger="load" hx-get="/api/activities/" hx-swap="innerHTML"></div>
```

First, we create a `div` that makes a `GET` request to `/api/activities/` when the page finishes loading. This API returns the first page of activities to display. In Django, a class-based view is implemented to look like:

```python
# views.py
from django.views.generic import ListView

class ActivityListView(ListView):
    model = Activity
    paginate_by = 25
    template_name = "activities.html"

    def get_queryset(self):
        return Activity.objects.all()

# urls.py
urlpatterns = [
    path('api/activities/', ActivityListView.as_view()),
]
```

And last but not least, the Django template is something like this:

{% highlight django %}
{% for activity in activities %}
  <div
    class="activity"
    {% if forloop.last and page_obj.has_next %}
    hx-get="/api/activities/?page={{ page_obj.next_page_number }}"
    hx-trigger="revealed"
    hx-swap="afterend"
    {% endif %}
  >
    <h1>{{ activity.title }}</h1>
  </div>
{% endfor %}
{% endhighlight %}


In the above template, when the loop is on its final iteration we add some HTMX to the `div.activity` element:
* `hx-get` is set to the endpoint with next page number in the query params
* `hx-trigger` is set to `revealed` which triggers the request when that element appears in the viewport
* `hx-swap` is set to `afterend` to append the results after that element

Now when the user scrolls to the end of the activity list, the last element comes into view and triggers the request to load the next page of results which is then appended to the list. Nice.

### Forms + HTMX
If we combine the two examples above, it becomes trivial to add filtering to a list of model instances.
```html
<form id="activity-filters" hx-get="/api/activities/" hx-target="#activity-list">
  <input type="number" name="pace" />
  <button type="submit">Submit</button>
</form>
<div
  id="activity-list"
  hx-get="/api/activities/"
  hx-include="#activity-filters"
  hx-trigger="load"
  hx-swap="innerHTML"
></div>
```
In the above example, `#activity-list` will load the first page of activity results including any values set in the `#activity-filters` form in the query string. When the `#activity-filters` form is submitted, it will trigger a `GET` request to `/api/activities/` with form values included in the query string, so `GET /api/activities/?pace=` or, if there is a value set, `GET /api/activities/?pace=10`.

### Wrapping Up
So we can see Django + HTMX is a powerful combination. Modern interactive web applications *are possible* without writing massive React apps. That is not to suggest React is bad or shouldn't be used, only that there are always other ways of doing things.

### Questions?
Reach out over [email][4] or one of the other social links here with questions or to tell me I am wrong about something. 😀


[1]: https://htmx.org/
[2]: https://www.chartjs.org/
[3]: https://rundashapp.com/
[4]: mailto:mark@meltdownlabs.com?subject=Django%20+%20HTMX
