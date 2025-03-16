import { Methods } from "@/lib/logs";

export function methodTextColor(method: Methods) {
  let className;
  switch (method) {
    case "GET":
      className = "text-blue-500";
      break;
    case "POST":
      className = "text-green-500";
      break
    case "PUT":
      className = "text-yellow-500";
      break;
    case "PATCH":
      className = "text-orange-400";
      break;
    case "DELETE":
      className = "text-red-500";
  }
  return className;
}


export function methodBgColor(method: Methods) {
  let className;
  switch (method) {
    case "GET":
      className = "bg-blue-800";
      break;
    case "POST":
      className = "bg-green-800";
      break;
    case "PUT":
      className = "bg-yellow-700";
      break;
    case "PATCH":
      className = "bg-orange-800";
      break;
    case "DELETE":
      className = "bg-red-800";
  }
  return className;
}
