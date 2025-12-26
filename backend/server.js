import { createServer } from "http";
import { readDB, writeDB } from "./util/jsonDB.js";

// Database
let taskId = 1;
let db = {};

readDB().then((dbData) => {
  console.log(dbData);
  db = dbData;
});

// CORS configuration
function serverResponse(res, data) {
  const ALLOWED_ORIGIN = process.env.CLIENT_URL || "*";
  const headers = {
    "Content-Type": "application/json",
  };
  if (ALLOWED_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
  }
  res.writeHead(data.status, headers);
  res.end(JSON.stringify(data));
}
const server = createServer((req, res) => {
  let response = {
    status: 200,
  };

  // [OPTIONS] - Handle preflight requests
  if (req.method === "OPTIONS") {
    const ALLOWED_ORIGIN = process.env.CLIENT_URL || "*";
    const headers = {};
    if (ALLOWED_ORIGIN) {
      headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
      headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE";
      headers["Access-Control-Max-Age"] = 60;
    }
    res.writeHead(200, headers);
    res.end();
    return;
  }

  //   [GET] /api/task/
  if (req.method === "GET" && req.url === "/api/tasks") {
    response.data = db.tasks;
    return serverResponse(res, response);
  }
  //   [GET] /api/task/id
  if (req.method === "GET" && req.url.startsWith("/api/tasks")) {
    const id = +req.url.split("/").pop();
    const task = db.tasks.find((_task) => _task.id === id);
    if (task) {
      response.data = task;
    } else {
      response.status = 404;
      response.data = { message: " Resource not found " };
    }
    return serverResponse(res, response);
  }

  //   [POST] /api/task/
  if (req.method === "POST" && req.url.startsWith("/api/tasks")) {
    console.log("[response.data]", req.method);
    let body = "";
    console.log(body, "body");
    req.on("data", (buffer) => {
      body += buffer.toString();
    });
    req.on("end", () => {
      const payload = JSON.parse(body);
      const newTask = {
        id: taskId++,
        title: payload.title,
        isCompleted: false,
      };

      db.tasks.push(newTask);
      writeDB(db);

      response.status = 201;
      response.data = newTask;
      serverResponse(res, response);
    });
    return;
  }
  // [PATCH] /api/tasks/:id
  if (req.method === "PATCH" && req.url.startsWith("/api/tasks/")) {
    const id = +req.url.split("/").pop();
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const payload = JSON.parse(body);
      const task = db.tasks.find((t) => t.id === id);
      if (!task) {
        response.status = 404;
        response.data = { message: "Resource not found" };
        return serverResponse(res, response);
      }
      if (payload.title !== undefined) {
        task.title = payload.title;
      }

      if (payload.isCompleted !== undefined) {
        task.isCompleted = payload.isCompleted;
      }

      response.status = 200;
      response.data = task;
      return serverResponse(res, response);
    });

    return;
  }
  //   [DELETE] /api/task/
  if (req.method === "DELETE" && req.url.startsWith("/api/tasks/")) {
    const id = +req.url.split("/").pop();
    const task = db.tasks.find((_task) => _task.id === id);
    if (task) {
      response.data = null;
      response.status = 200;
    } else {
      response.status = 404;
    }
  }
});
const port = process.env.PORT || 3000;
server.listen(port, "127.0.0.1", () => {
  console.log(`Server listening on port ${port}`);
});
