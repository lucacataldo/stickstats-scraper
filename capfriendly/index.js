require("dotenv").config();

let axios = require("axios");
let cheerio = require("cheerio");
let fs = require("fs");

const userAgent =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0";

const teams = [
	{ id: 10, name: "mapleleafs" },
	{ id: 24, name: "ducks" },
	{ id: 53, name: "coyotes" },
	{ id: 6, name: "bruins" },
	{ id: 7, name: "sabres" },
	{ id: 20, name: "flames" },
	{ id: 12, name: "hurricanes" },
	{ id: 16, name: "blackhawks" },
	{ id: 21, name: "avalanche" },
	{ id: 29, name: "bluejackets" },
	{ id: 25, name: "stars" },
	{ id: 17, name: "redwings" },
	{ id: 22, name: "oilers" },
	{ id: 13, name: "panthers" },
	{ id: 26, name: "kings" },
	{ id: 30, name: "wild" },
	{ id: 8, name: "canadiens" },
	{ id: 18, name: "predators" },
	{ id: 1, name: "devils" },
	{ id: 2, name: "islanders" },
	{ id: 3, name: "rangers" },
	{ id: 9, name: "senators" },
	{ id: 4, name: "flyers" },
	{ id: 5, name: "penguins" },
	{ id: 28, name: "sharks" },
	{ id: 55, name: "kraken" },
	{ id: 19, name: "blues" },
	{ id: 14, name: "lightning" },
	{ id: 23, name: "canucks" },
	{ id: 54, name: "goldenknights" },
	{ id: 15, name: "capitals" },
	{ id: 52, name: "jets" },
];

var teamNum = 0;
var timer = setInterval(() => {
	if (teams[teamNum]) {
		let team = teams[teamNum];
		getTeam(team);

		teamNum++;

		// clearInterval(timer); //testing
	} else {
		clearInterval(timer);
	}
}, 500);

function getTeam(team) {
	axios
		.get(`https://www.capfriendly.com/teams/${team.name}`, {
			headers: {
				"User-Agent": userAgent,
			},
		})
		.then((r) => {
			let html = r.data;
			let rows = [];
			let data = {};

			const $ = cheerio.load(html);

			$("#team .odd.c, #team .even.c").each((i, el) => {
				rows.push(el);
			});

			rows.forEach((row) => {
				let $ = cheerio.load(row);
				let name = $("td:nth-child(1) a")
					.text()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "");
				let age = $("td:nth-child(7) > span:nth-child(1)").text();
				let capHit = $("td:nth-child(9) > span:nth-child(1)").text();
				let yearsLeft = 0;
				let expiryStatus = "";

				let cols = $("td").each(function (i, elem) {
					if (i > 7) {
						let coltxt = $(this).find("span:nth-child(1)").text();
						if (coltxt !== "") {
							yearsLeft++;
						}
					}
				});

				if ($.text().includes("UFA")) {
					expiryStatus = "UFA";
				} else if ($.text().includes("RFA")) {
					expiryStatus = "RFA";
				}

				data[name] = { capHit, age, yearsLeft, expiryStatus };

				console.log(data[name]);
			});

			fs.writeFileSync(
				`${process.env.OUTPUT_FOLDER}/${team.id}.json`,
				JSON.stringify(data),
				"utf-8"
			);
		});
}
