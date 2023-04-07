---
tags:
  - posts
  - tech
date: 2023-02-16
title: How to disable GraphQL introspection in Graphene
description: Introspection in GraphQL allows an attacker to learn everything about your API's schema including queries, mutations, types, fields, and directives. It is therefore important to disable introspection on production GraphQL APIs.
---
Introspection in GraphQL allows an attacker to learn everything about your API's schema including queries, mutations, types, fields, and directives. It is therefore important to disable introspection on production GraphQL APIs.<!-- excerpt -->

### Background
When searching Google for how to tackle disabling introspection in [Graphene](https://github.com/graphql-python/graphene), the top results recommend a custom middleware approach. However, this isn't very efficient since GraphQL middlewares run for every field in a given operation. If you have any queries with a subtantial amount of fields, it's just a waste of time to check for introspection on every single field to be resolved.

### The Graphene/GraphQL Way
There is a simpler way and it involves GraphQL validation rules. [In fact, Graphene has a section of their docs showing exactly how to do it this way, but it's at the bottom of Google.](https://docs.graphene-python.org/en/latest/execution/queryvalidation/#disable-introspection) If you want, you can stop reading this and just click that link. I won't be offended.

Graphene ships with a validation rule `DisableIntrospection`. This can be passed to the schema validator like this:
```python
from graphql import validate
from graphene.validation import DisableIntrospection
from my_graphql import schema

errors = validate(
  schema=schema,
  rules=(DisableIntrospection,)
)
```

### With Django
In my case, I'm using a custom view for the GraphQL endpoint which inherits from `graphene_django.views.GraphQLView` and happens to override `GraphQLView.execute_graphql_request` which in turn calls `validate`. I only want to disable introspection in production, so to conditionally apply the `DisableIntrospection` rule I use a partial:
```python
from functools import partial
from graphql import validate
from graphene.validation import DisableIntrospection
from graphene_django.views import GraphQLView
from django.conf import settings

if settings.PRODUCTION:
  validate = partial(
    validate,
    rules=(DisableIntrospection,)
  )

class MyGraphQLView(GraphQLView)
  def execute_graphql_request(self, *args, **kwargs):
    # ...
    errors = validate(
      self.schema.graphql_schema,
      document
    )
    # ...
    return self.schema.execute()
```

That's it. No middlewares required. Go forth and lock down your GraphQL APIs!
