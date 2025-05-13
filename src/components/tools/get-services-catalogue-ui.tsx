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
      message: `Selected ${selectedService.service.service} (${selectedService.category.category}) - ${selectedService.service.price} for ${selectedService.service.duration}`,
    });
  };

  const handleCancel = () => {
    setSelectedService(null);
    setIsConfirming(false);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading services catalogue...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (!catalogue.length) {
    return null;
  }

  // Show success confirmation after service is selected
  if (result?.status === "selected" && result.selectedService) {
    return (
      <div className="my-8 rounded-lg border border-teal-200 bg-white p-6 shadow-md">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">
            Service Selected
          </h3>
        </div>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {result.selectedService.service}
          </p>
          <p>{result.selectedService.category}</p>
          <p>Price: {result.selectedService.price}</p>
          <p>Duration: {result.selectedService.duration}</p>
          <p className="mt-2">{result.selectedService.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isConfirming && selectedService ? (
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">
            Confirm Service Selection
          </h3>
          <div className="mb-4">
            <div className="font-medium">{selectedService.service.service}</div>
            <div className="text-muted-foreground">
              {selectedService.category.category} -{" "}
              {selectedService.service.price}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <div>{selectedService.service.description}</div>
              <div>Duration: {selectedService.service.duration}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleConfirm} className="flex-1 bg-teal-600 text-white hover:bg-teal-700">
              Confirm Selection
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1 border-teal-600 text-teal-600 hover:bg-teal-50 hover:text-teal-700">
              Choose Different Service
            </Button>
          </div>
        </div>
      ) : (
        catalogue.map((category) => (
          <div key={category.category} className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">{category.category}</h3>
            <div className="divide-y">
              {category.services.map((service) => (
                <button
                  key={service.service}
                  onClick={() => handleServiceSelect(category, service)}
                  className="w-full text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{service.service}</span>
                      <span className="text-muted-foreground">{service.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
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
