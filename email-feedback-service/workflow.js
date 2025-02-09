/*
 * To set up the project, install the dependencies, and run the application, follow these steps:
 *
 * 1. Install the Conductor JavaScript SDK:
 *    npm install @io-orkes/conductor-javascript
 *    or
 *    yarn add @io-orkes/conductor-javascript
 *
 * 2. Run the JavaScript file (replace yourFile.js with your actual file name):
 *    node yourFile.js
 */

import {
	orkesConductorClient,
	TaskManager,
} from "@io-orkes/conductor-javascript";
import axios from "axios";

const MakeARequest = async (email, formLink) => {
	const params = new URLSearchParams();
	params.append("from", "hello@sourcifyin.xyz");
	params.append("to", email);
	params.append("subject", "Feedback Form");
	params.append(
		"text",
		`Please provide your feedback on our recent changes. Please fill up this form: ${formLink}`
	);

	return await axios.post(
		"https://api.mailgun.net/v3/sourcifyin.xyz/messages",
        params,
		{
			headers: { Accept: "application/json" },
            auth: {
				username: "api",
				password: "a325dd460233c2dfc22075ea7601efc8-667818f5-d8df55a2",
			},
		},
	);
};

async function test() {
	const clientPromise = orkesConductorClient({
		// keyId: "XXX", // optional
		// keySecret: "XXXX", // optional
		TOKEN:
			"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtqbVlNWThEV2VOU1lKZmZSSjFXNSJ9.eyJnaXZlbl9uYW1lIjoiUm9oaXQiLCJmYW1pbHlfbmFtZSI6IlBhdWwiLCJuaWNrbmFtZSI6InJvaGl0cGF1bGluNjQiLCJuYW1lIjoiUm9oaXQgUGF1bCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLOHUtWUFKck1nb0JMZFd3WERWSmhGYTNDdDUyNU1BVjFtU2RNb1pJZjNSZm9KNU1BPXM5Ni1jIiwidXBkYXRlZF9hdCI6IjIwMjUtMDItMDhUMTI6MjE6MzEuNDU2WiIsImVtYWlsIjoicm9oaXRwYXVsaW42NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9hdXRoLm9ya2VzLmlvLyIsImF1ZCI6Ik15SEpZdVRzcU5MOERhTElHd291NmZTYXh6RjNURnJXIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTEyMTE3MDU3MTY2NjQ1MzcyNjMiLCJpYXQiOjE3MzkwMTcyOTQsImV4cCI6MTczOTA1MzI5NCwic2lkIjoiQkNJcmtmSEJXelNGdEJveFBBZnFMQzFINS02THBXRVgiLCJub25jZSI6ImFFZFZkSDVVTG5kVlFsTjJiM1pIWkc5aGRHdDVSVlpxU1ZWUGNTNDJSamxDYVRnd01IUXRUMjVCY2c9PSJ9.gfltkPm0ph5lL9DRyr93zKaziQpYDxJ3-SGAVbuPdrS6-W03D0FY7zvapiXkyb9hH16KaiC2vT0P-qNB_2_EbE1GKj4GAVO79F-plCuvevN78C0F9EzcoPF9C15CBjNTP4_gIG4yDXhGbVJ-ogTq62TS5JKE0cc2XW2lYPOq1oxyaDhTDLLXq_ULNMCK-PC5lzRFBtV4QbQowqQ3VqWtfNHGpDHvRFZ6IHsmlitfv_kNlEIyFX01MKtAmNW9k8YBDPPdylojs8z6j420FdELxSbu6SdpLH1vhhtKtplJTYKc3c2ze7Ifdui1yVKsOT44X8a1NIiB15ZoYSIgxuV-Vg",
		serverUrl: "https://developer.orkescloud.com/api",
	});

	const client = await clientPromise;

	const customWorker = {
		taskDefName: "send_email",
		execute: async ({ inputData, taskId }) => {
			const email = inputData.email;
			const formLink = inputData.formLink;

			const res = await MakeARequest(email, formLink);
			console.log(res);

			return {
				outputData: {
					greeting: `Email Sent ${email}`,
				},
				status: "COMPLETED",
			};
		},
	};

	const manager = new TaskManager(client, [customWorker], {
		options: { pollInterval: 100, concurrency: 1 },
	});

	manager.startPolling();
}
test();
