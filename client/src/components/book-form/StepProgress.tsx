interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  const steps = [
    { id: 1, label: "Child Info" },
    { id: 2, label: "Character" },
    { id: 3, label: "Story" },
    { id: 4, label: "Preview" },
    { id: 5, label: "Checkout" }
  ];

  return (
    <div className="flex justify-between mb-12 max-w-3xl mx-auto relative">
      <div className="absolute top-1/2 h-1 bg-gray-200 left-0 right-0 -translate-y-1/2 z-0"></div>
      
      {steps.map((step) => (
        <div 
          key={step.id}
          className={`progress-step flex flex-col items-center relative z-10 ${
            step.id === currentStep 
              ? 'active' 
              : step.id < currentStep 
                ? 'completed' 
                : ''
          }`}
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step.id === currentStep 
                ? 'bg-[#FF6B6B] text-white' 
                : step.id < currentStep 
                  ? 'bg-[#6BCB77] text-white' 
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step.id}
          </div>
          <span className="mt-2 text-sm font-medium">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
