type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea" | "json";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type Operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

/**
 * This list of operations is used to generate the manual testing UI.
 */
const operations: Operation[] = [
  /////// user login /////////
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update Password",
    endpoint: "/api/users/password",
    method: "PATCH",
    fields: { currentPassword: "input", newPassword: "input" },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users (empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  /////// posts /////////
  {
    name: "Get Posts (empty for all)",
    endpoint: "/api/posts",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Create Post",
    endpoint: "/api/posts",
    method: "POST",
    fields: { content: "input" },
  },
  {
    name: "Update Post",
    endpoint: "/api/posts/:id",
    method: "PATCH",
    fields: { id: "input", content: "input", options: { backgroundColor: "input" } },
  },
  {
    name: "Delete Post",
    endpoint: "/api/posts/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  /////// items for sale /////////
  {
    name: "Get Items for Sale(empty for all)",
    endpoint: "/api/items",
    method: "GET",
    fields: { seller: "input" },
  },
  {
    name: "Put Item Up for Sale",
    endpoint: "/api/items",
    method: "POST",
    fields: { name: "input", cost: "input", description: "input", pictures: "input", contact: "input" },
  },
  {
    name: "Update Item",
    endpoint: "/api/items/:itemId",
    method: "PATCH",
    fields: { id: "input", name: "input", cost: "input", description: "input", pictures: "input", contact: "input" },
  },
  {
    name: "Delete Item",
    endpoint: "/api/items/:itemId",
    method: "DELETE",
    fields: { id: "input" },
  },

  /////// comments /////////
  {
    name: "Get Comments",
    endpoint: "/api/items/:itemId/comments",
    method: "GET",
    fields: { itemId: "input" },
  },
  {
    name: "Create Comment",
    endpoint: "/api/items/:itemId/comments",
    method: "POST",
    fields: { itemId: "input", comment: "input" },
  },
  {
    name: "Edit Comment",
    endpoint: "/api/items/:itemId/comments/:commentId",
    method: "PATCH",
    fields: { itemId: "input", commentId: "input", comment: "input" },
  },
  {
    name: "Delete Comment",
    endpoint: "/api/items/:itemId/comments/:commentId",
    method: "DELETE",
    fields: { itemId: "input", commentId: "input" },
  },
  /////// claiming items /////////
  {
    name: "Get Queue Position",
    endpoint: "/api/items/:itemId/position",
    method: "GET",
    fields: { itemId: "input" },
  },
  {
    name: "Get Item Queue",
    endpoint: "/api/items/:itemId/queue",
    method: "GET",
    fields: { itemId: "input" },
  },
  {
    name: "Claim Item",
    endpoint: "/api/items/:itemId/claim",
    method: "PATCH",
    fields: { itemId: "input" },
  },
  {
    name: "Unclaim Item",
    endpoint: "/api/items/:itemId/unclaim",
    method: "PATCH",
    fields: { itemId: "input" },
  },
  /////// rating /////////
  {
    name: "Get Seller's Rating",
    endpoint: "/api/ratings",
    method: "GET",
    fields: { seller: "input" },
  },
  {
    name: "Rate item",
    endpoint: "/api/ratings/:itemId",
    method: "POST",
    fields: { seller: "input", item: "input", rating: "input" },
  },
  {
    name: "Change Rating",
    endpoint: "/api/ratings/:itemId",
    method: "PATCH",
    fields: { seller: "input", item: "input", rating: "input" },
  },
];

/*
 * You should not need to edit below.
 * Please ask if you have questions about what this test code is doing!
 */

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      const htmlTag = tag === "json" ? "textarea" : tag;
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${htmlTag} name="${prefix}${name}"></${htmlTag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const op = operations.find((op) => op.endpoint === $endpoint && op.method === $method);
  const pairs = Object.entries(reqData);
  for (const [key, val] of pairs) {
    if (val === "") {
      delete reqData[key];
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = key.split(".").reduce((obj, key) => obj[key], op?.fields as any);
    if (type === "json") {
      reqData[key] = JSON.parse(val as string);
    }
  }

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
