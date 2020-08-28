const faker = require('faker');
const Post = require('./models/post');

async function seedPosts() {
	await Post.deleteMany({});
	for(const i of new Array(600)) {
		const random15 = 15;
		const random5 = Math.floor(Math.random() * 6);
		const title = faker.lorem.word();
		const category = faker.lorem.text();
		const tag = faker.lorem.text();
		const url = faker.lorem.text();
		const body = faker.lorem.text();
		const footer = faker.lorem.text();
		const postData = {
			title,
			category,
			tag,
			url,
			body,
			footer,
			read: random15,
			author: '5f2a993fe6db1a0ea0c2aa24'
		}
		let post = new Post(postData);
		await post.save();
	}
	console.log('600 new posts created');
}

module.exports = seedPosts;