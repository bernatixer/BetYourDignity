# Bet Your Dignity

Funny game to like and follow Instagram friends

## Usage

Run it locally:

```bash
npm install
node server.js
```

## Inspiration

We basically wanted to create some kind of game to blow people's mind. After checking all sponsors challenges and APIs, we found Facebook API's graph storage system very interesting. We love graphs!

Finally, after some brainstorming, we decided to use Instagram API and create a shooting 2D game where you shoot your own posts looking for likes.

## What it does

Two players in a 2D platform environment. Each one is logged with their Instagram account. The mission is to defeat the other... _How?_ Shooting your account posts from your feed to the other player. If any of your posts hit the rival, he/she loses one life (five in total) and, automatically, **gives a like to the received post**.

## How we built it

We split the application into three very different parts:

### Instagram Client

This past is basically a Node.js server that implements all needed operations related with Instagram for the game.

Some examples are: `getAccountMedia(sessionId: String): Set(MediaItems)`, `likePost(sessionId: String, mediaId: String): Void`.

As mentioned, we used the **Facebook API** (Instagram), **Node.js** for the server and a Node package that eased the work with the Instagram API.

### Game connection

We wanted it to be a multiplayer game and that each player could play from his/her laptop.

To make the game fair and have a good connection, we used **socket.io**.

### Game UI

Last but not least, the Game itself, the UI. Using **Phraser.js** we made this simple but good looking game interface.

Image loading, physics, collision control, etc.

We used the HackUPC mascot (Biene) for players' skin.

## Challenges we ran into

- Understanding how to get access to Instagram API.
- Understanding the Graph data structure of Facebook API.
- Connecting players among them by using sockets.
- Synching players actions to make the game as fair and smooth as possible.
- Applying physics to the players.
- Applying collisions with the environment.
- **Joining all the stack together** :)

## Accomplishments that we're proud of

- Make a clean usage of the Instagram NPM Package
- Reduce sockets delay to levels that are almost impossible to notice
- Accomplish a good UX in the Game itself.

## What we learned

We are not used to **JavaScript**, some of us have used it on other occasions, but not that much. None of us had never used **Phraser.js** for a video game.

Others are very good at **web development**, but others had never worked on a website. During this hackathon all of us had developed some part of the web.

**Team-working** and amount of work management. We knew each other before the Hackathon, but we had never worked together in a project like this.

## What's next for BetYourDignity

We also would like to shoot your followers and make the other player follow your followers. It could be very cool because the third person would receive the notification. Currently is not possible because Instagram blocks this behaviour to avoid SPAM.
