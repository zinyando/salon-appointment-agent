import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState } from "react";
import { type ServiceCategory } from "@/app/api/services-catalogue/route";

type CatalogueResult = {
  catalogue: ServiceCategory[];
  status: "completed" | "error";
  message?: string;
};

type CatalogueComponentProps = {
  status: { type: string };
  result?: CatalogueResult;
  addResult: (result: CatalogueResult) => void;
};

const CatalogueComponent = ({ status, result, addResult }: CatalogueComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/services-catalogue");
      if (!response.ok) {
        throw new Error("Failed to fetch services catalogue");
      }
      const data = await response.json();
      addResult({
        catalogue: data.catalogue,
        status: "completed",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      addResult({
        catalogue: [],
        status: "error",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch catalogue when component mounts
  useState(() => {
    if (!result && status.type === "started") {
      fetchCatalogue();
    }
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading services catalogue...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!result?.catalogue) {
    return null;
  }

  return (
    <div className="space-y-6">
      {result.catalogue.map((category) => (
        <div key={category.category} className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">{category.category}</h3>
          <div className="divide-y">
            {category.services.map((service) => (
              <div
                key={service.service}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{service.service}</span>
                  <span className="text-gray-600">{service.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{service.description}</span>
                  <span>{service.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

type EmptyInput = Record<string, never>;

export const GetServicesCatalogueUI = makeAssistantToolUI<EmptyInput, CatalogueResult>({
  toolName: "getServicesCatalogue",
  render: (props) => <CatalogueComponent {...props} />,
});
