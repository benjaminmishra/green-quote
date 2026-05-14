"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { generateOpenApiSpec } from "@/shared/openapi";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocs() {
  const spec = generateOpenApiSpec();
  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}
