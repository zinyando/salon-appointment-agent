import { makeAssistantToolUI } from "@assistant-ui/react";
import { useEffect, useState } from "react";
import { type ServiceCategory } from "@/app/api/services-catalogue/route";
import { Button } from "@/components/ui/button";

type CatalogueResult = {
  catalogue: ServiceCategory[];
  selectedService?: {
    category: string;
    service: string;
    price: string;
    duration: string;
    description: string;
  };
  status: "completed" | "error" | "selected";
  message?: string;
};

type CatalogueComponentProps = {
  status: { type: string };
  result?: CatalogueResult;
  addResult: (result: CatalogueResult) => void;
};

const CatalogueComponent = ({
  status,
  result,
  addResult,
}: CatalogueComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogue, setCatalogue] = useState<ServiceCategory[]>([]);
  const [selectedService, setSelectedService] = useState<{
    category: ServiceCategory;
    service: ServiceCategory["services"][0];
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchCatalogue = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/services-catalogue");
        if (!response.ok) {
          throw new Error("Failed to fetch services catalogue");
        }
        const data = await response.json();
        setCatalogue(data.catalogue);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
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

    console.log("Status", status);
    if (!result?.catalogue?.length && status.type === "requires-action") {
      fetchCatalogue();
    } else if (result?.catalogue?.length) {
      setCatalogue(result.catalogue);
    }
  }, [result, status, addResult]);

  const handleServiceSelect = (
    category: ServiceCategory,
    service: ServiceCategory["services"][0]
  ) => {
    setSelectedService({ category, service });
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    if (!selectedService) return;

    addResult({
      catalogue: catalogue,
      selectedService: {
        category: selectedService.category.category,
        ...selectedService.service,
      },
      status: "selected",
    });
  };

  const handleCancel = () => {
    setSelectedService(null);
    setIsConfirming(false);
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading services catalogue...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!catalogue.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {isConfirming && selectedService ? (
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">
            Confirm Service Selection
          </h3>
          <div className="mb-4">
            <div className="font-medium">{selectedService.service.service}</div>
            <div className="text-gray-600">
              {selectedService.category.category} -{" "}
              {selectedService.service.price}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              <div>{selectedService.service.description}</div>
              <div>Duration: {selectedService.service.duration}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleConfirm} className="flex-1">
              Confirm Selection
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Choose Different Service
            </Button>
          </div>
        </div>
      ) : (
        catalogue.map((category) => (
          <div key={category.category} className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">{category.category}</h3>
            <div className="divide-y">
              {category.services.map((service) => (
                <button
                  key={service.service}
                  onClick={() => handleServiceSelect(category, service)}
                  className="w-full text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{service.service}</span>
                      <span className="text-gray-600">{service.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{service.description}</span>
                      <span>{service.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

type EmptyInput = Record<string, never>;

export const GetServicesCatalogueUI = makeAssistantToolUI<
  EmptyInput,
  CatalogueResult
>({
  toolName: "getServicesCatalogue",
  render: (props) => <CatalogueComponent {...props} />,
});
