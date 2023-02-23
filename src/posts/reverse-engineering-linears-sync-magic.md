---
tags:
  - posts
  - tech
date: 2022-12-20
title: Reverse Engineering Linear's Sync Magic
description: Linear is an issue tracker and project management tool for software engineering teams. This is perhaps an oversimplification, especially given their ambitions to be much more than that, but it’s enough to provide some context.
---
<a href="https://linear.app/" target="_blank">Linear</a> is an issue tracker and project management tool for software engineering teams. This is an oversimplification, <a href="https://linear.app/releases/2022" target="_blank">especially given their ambitions to be much more than that</a>, but it’s enough to provide some context.<!-- excerpt -->

**Update 2023-02-23**: I recently came across a talk given by Tuomas Artman on exactly how their sync works. It is from 2020 so may not be exactly how it still works, but it's likely still relevant:
<iframe width="560" height="315" src="https://www.youtube.com/embed/WxK11RsLqp4?start=2175" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

[He also points to a blog post from Figma which works similarly.](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)

### Why?
I recently signed up for Linear to try it out and see how it was. Immediately I noticed how fast and responsive it felt. Every interaction was instant. It is a breath of fresh air after struggling with other similar and slower tools which I won’t name specifically. I was curious how they were doing things, so first I tried Googling to find their tech stack. I found the [following tweet from 2019 by Tuomas Artman, Linear's co-founder][1] in response to somebody asking how they were building:

>*"A pretty basic stack. React, MobX, Typescript and Node with PostgreSQL. And some home-made sync magic."*

*What exactly is this "home-made sync magic"?* This is the question I seek to answer here, so I opened up Chrome DevTools and dove in. The magic seems to mostly be persisting model snapshots for each create, update, or delete action which they call a `SyncAction`.

### Summary/TLDR
Linear stores a copy of most (all?) data locally in IndexedDB and pushes updates over WebSockets. It uses a bootstrap process to get the initial state and then applies changesets as they come (from you or other users in your org) to keep the local copy of data in sync with the server. It is able to apply a range of changesets from one point in time to another using a concept of `SyncAction`s.

### First Bootstrap (Full)
Loading Linear App for the first time in a fresh browser (or Incognito) will trigger a request to bootstrap the app with all data it needs to render using their `/sync/bootstrap` endpoint. This endpoint accepts a `type` query parameter which can be `full`, `partial`, or perhaps other values. This first bootstrap call looks something like:

```
GET /sync/bootstrap?type=full&onlyModels=ApiKey,Attachment,RoadmapToProject,Roadmap,ViewPreferences,CustomView,Cycle,Document,Emoji,IssueImport,Integration,IntegrationResource,IntegrationsSettings,WorkflowState,PushSubscription,NotificationSubscription,Team,Issue,IssueLabel,IssueRelation,ProjectUpdate,OauthClientApproval,Notification,OauthClient,Organization,OrganizationDomain,OrganizationInvite,Project,ProjectLink,ProjectUpdateInteraction,Subscription,TeamKey,TeamMembership,Template,User,UserSettings,Webhook,IntegrationTemplate,WorkflowDefinition,Favorite
```

The `onlyModels` query parameter lists the models needed to render Linear’s main UI components. Projects, Issues, Teams, etc. So from this bootstrap call, we get the following list of models:
- ApiKey
- Attachment
- RoadmapToProject
- Roadmap
- ViewPreferences
- CustomView
- Cycle
- Document
- Emoji
- IssueImport
- Integration
- IntegrationResource
- IntegrationsSettings
- WorkflowState
- PushSubscription
- NotificationSubscription
- Team
- Issue
- IssueLabel
- IssueRelation
- ProjectUpdate
- OauthClientApproval
- Notification
- OauthClient
- Organization
- OrganizationDomain
- OrganizationInvite
- Project
- ProjectLink
- ProjectUpdateInteraction
- Subscription
- TeamKey
- TeamMembership
- Template
- User
- UserSettings
- Webhook
- IntegrationTemplate
- WorkflowDefinition
- Favorite

The `/sync/bootstrap` endpoint returns a `text/plain` content type. The body consists of multiple lines, each in the shape of `ModelName=<JSON representation of model>`. For example, a response representing 3 `Issue`s might look like:
```
Issue={"id":"****","createdAt":"2022-12-20T02:34:01.396Z","updatedAt":"2022-12-20T02:43:40.348Z","number":20,"title":"Test1","priority":0,"boardOrder":0,"sortOrder":-9014,"labelIds":[],"teamId":"****","projectId":"****","subscriberIds":["****"],"previousIdentifiers":[],"creatorId":"****","stateId":"****","parentId":"****","subIssueSortOrder":8064.65}
Issue={"id":"****","createdAt":"2022-12-20T02:21:59.970Z","updatedAt":"2022-12-20T02:43:40.376Z","number":19,"title":"Test2","priority":0,"boardOrder":0,"sortOrder":-7930,"labelIds":[],"teamId":"****","projectId":"****","subscriberIds":["****"],"previousIdentifiers":[],"creatorId":"****","stateId":"****","parentId":"****","subIssueSortOrder":7159.96}
Issue={"id":"****","createdAt":"2022-12-20T02:21:08.526Z","updatedAt":"2022-12-20T02:43:40.408Z","number":18,"title":"Test3","priority":0,"boardOrder":0,"sortOrder":-6934,"labelIds":[],"teamId":"****","projectId":"****","subscriberIds":["****"],"previousIdentifiers":[],"creatorId":"****","stateId":"****","parentId":"****","subIssueSortOrder":6063.54}
```

At the end of this list of models is a `_metadata_` key which looks like:
```
_metadata_={"method":"postgres","lastSyncId":613955486,"subscribedSyncGroups":["***","***"],"databaseVersion":514}
```

Note the `lastSyncId` value. We will get into this later, but this is how Linear keeps track of data freshness ensuring your local copy of the data is correct.

### Second Bootstrap (Partial)
After the initial bootstrap completes, a second request to `/sync/bootstrap/` fires off, this time with `type=partial` instead of `type=full` and a more limited set of models in the `onlyModels` query parameter:

- Comment
- IssueHistory

These models are likely deferred from the first bootstrap since A. there can be multiples of them compared to the # of other models and B. they are less critical to render the page.

This data is again stored in IndexedDB for fast offline access.

### Keeping in Sync
#### WebSockets
Every change in Linear appears to result in a new `SyncAction` object with a unique ID. For example, creating a comment fires a GraphQL query that looks something like:

```graphql
mutation CommentCreate {
  commentCreate(input: {id: "***", bodyData: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Test\"}]}]}", issueId: "***"}) {
    lastSyncId
  }
}
```

Notice that the only requested field in the response is `lastSyncId`. This is how most mutations look in Linear.

A `SyncAction` appears to have the following schema:

```graphql
id - int
action - str ("I" for "Insert", "U" for "Update", "D" for "Delete", and "A" for "Archive" (?))
data - object or null
modelId - str (guid)
modelName - str
```

The above mutation results in a WebSocket push from the server which contains an array of `SyncAction`s and looks like:

```graphql
{
  "cmd": "sync",
  "sync": [
    {
      "id": 614001964,
      "modelName": "Comment",
      "modelId": "***",
      "action": "I",
      "data": {
        "id": "***",
        "userId": "***",
        "issueId": "***",
        "bodyData": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Test\"}]}]}",
        "createdAt": "2022-12-20T21:31:55.693Z",
        "updatedAt": "2022-12-20T21:31:55.693Z",
        "reactionData": []
      }
    },
    {
      "id": 614001967,
      "modelName": "Issue",
      "modelId": "***",
      "action": "U",
      "data": {
        "id": "***",
        "title": "Test1",
        "number": 11,
        "teamId": "***",
        "cycleId": null,
        "dueDate": null,
        "stateId": "***",
        "trashed": null,
        "estimate": null,
        "labelIds": [
          "***"
        ],
        "parentId": null,
        "priority": 0,
        "createdAt": "2022-12-20T02:09:39.917Z",
        "creatorId": "***",
        "projectId": "***",
        "sortOrder": 81,
        "startedAt": null,
        "updatedAt": "2022-12-20T21:31:55.693Z",
        "archivedAt": null,
        "assigneeId": "***",
        "boardOrder": 0,
        "canceledAt": null,
        "completedAt": null,
        "snoozedById": null,
        "autoClosedAt": null,
        "issueImportId": null,
        "subscriberIds": [
          "***"
        ],
        "autoArchivedAt": null,
        "snoozedUntilAt": null,
        "sourceMetadata": null,
        "descriptionData": null,
        "previousIdentifiers": []
      }
    }
  ],
  "lastSyncId": 614001969
}
```

The `lastSyncId` is again used to communicate to the client if it is out of date or not. If there is a delta between the `lastSyncId` and the one stored locally, then this may trigger a…

### Delta Sync

The `/sync/delta` endpoint accepts at least three query parameters: `lastSyncId` and `toSyncId`, both representing `SyncAction` IDs. This endpoint returns the same shape as the bootstrap endpoint above, but instead returning only `SyncAction` objects:

```graphql
SyncAction={"id":614004255,"modelName":"Comment","modelId":"***","action":"D"}
SyncAction={"id":614001967,"modelName":"Issue","modelId":"***","action":"U","data":{"id":"***","title":"Test123","number":11,"teamId":"***","stateId":"***","labelIds":["***"],"priority":0,"createdAt":"2022-12-20T02:09:39.917Z","creatorId":"***","projectId":"***","sortOrder":81,"updatedAt":"2022-12-20T21:31:55.693Z","assigneeId":"***","boardOrder":0,"subscriberIds":["***"],"previousIdentifiers":[]}}
_metadata_={"syncActionsCount":0,"syncActionsSize":0}
```

These actions are then replayed locally on IndexedDB and the client is back up to date.

### MobX Disclaimer
Tuomas mentions they use MobX. I'm not primarily a frontend engineer, but from what I can tell MobX is a state management library similar to Redux. I'm not sure exactly how much of what I'm describing here is MobX (perhaps MobX can use IndexedDB as its data store?) versus some special handling by Linear's engineering team.

### Final Thoughts
These are just my guesses as to how their system works. I'm making assumptions based on what I could see in Chrome DevTools by observing HTTP requests and WebSocket messages. I would be happy for an engineer at Linear to reach out and explain to me how reality differs from what I've described here ;)

[1]: https://twitter.com/artman/status/1119046856317652992
