//Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { randomBytes } = require('crypto');
const app = express();
app.use(bodyParser.json());

//Create array to store comments
const commentsByPostId = {};

//Create endpoint for comments
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

//Create endpoint for posts
app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    //Get the post id from the url
    const { content } = req.body;
    //Get the content from the request body
    const comments = commentsByPostId[req.params.id] || [];
    //Get the comments from the array
    comments.push({ id: commentId, content });
    //Push the comment to the array
    commentsByPostId[req.params.id] = comments;
    //Set the comments to the array
    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
        },
    });
    //Send an event to the event bus
    res.status(201).send(comments);
    //Send back the comments
});

//Receive event from event bus
app.post('/events', (req, res) => {
    console.log('Event Received', req.body.type);
    res.send({});
});

//Listen on port 4001
app.listen(4001, () => {
    console.log('Listening on 4001');
});