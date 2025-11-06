"use client";

import React from "react";

export interface FunctionParameter {
  name: string;
  type: string;
  optional?: boolean;
  description: string;
}

export interface FunctionDocumentation {
  name: string;
  type: "query" | "mutation" | "action" | "internalQuery" | "internalMutation" | "internalAction";
  description: string;
  parameters: FunctionParameter[];
  returns: string;
  example?: string;
  explanation?: string;
}

interface FunctionTableProps {
  functions: FunctionDocumentation[];
  title: string;
  description?: string;
}

export function FunctionTable({ functions, title, description }: FunctionTableProps) {
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      
      <div className="space-y-8">
        {functions.map((func, index) => (
          <div
            key={`${func.name}-${index}`}
            className="border rounded-lg overflow-hidden bg-card"
          >
            {/* Function Header */}
            <div className="bg-muted/50 px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold font-mono">{func.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    func.type === "query"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : func.type === "mutation"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : func.type === "action"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {func.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{func.description}</p>
            </div>

            {/* Function Details */}
            <div className="px-6 py-4">
              {/* Parameters Table */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Parameters
                </h4>
                {func.parameters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-semibold">Name</th>
                          <th className="text-left py-2 pr-4 font-semibold">Type</th>
                          <th className="text-left py-2 pr-4 font-semibold">Required</th>
                          <th className="text-left py-2 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {func.parameters.map((param, paramIndex) => (
                          <tr key={paramIndex} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-mono text-xs">{param.name}</td>
                            <td className="py-2 pr-4">
                              <code className="px-2 py-1 bg-muted rounded text-xs">
                                {param.type}
                              </code>
                            </td>
                            <td className="py-2 pr-4">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  param.optional
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {param.optional ? "Optional" : "Required"}
                              </span>
                            </td>
                            <td className="py-2 text-muted-foreground">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No parameters</p>
                )}
              </div>

              {/* Returns */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                  Returns
                </h4>
                <code className="px-3 py-1.5 bg-muted rounded text-xs block w-fit">
                  {func.returns}
                </code>
              </div>

              {/* Example (if provided) */}
              {func.example && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                    Example
                  </h4>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                    <code>{func.example}</code>
                  </pre>
                </div>
              )}

              {/* Plain Language Explanation (if provided) */}
              {func.explanation && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                    What This Does
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {func.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
