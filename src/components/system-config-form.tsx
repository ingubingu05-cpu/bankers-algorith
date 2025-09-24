"use client";

import { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { SystemState } from '@/lib/types';
import { SlidersHorizontal, Check } from 'lucide-react';

interface SystemConfigFormProps {
  onSetup: (state: SystemState) => void;
}

const step1Schema = z.object({
  processes: z.coerce.number().int().min(1, "At least one process is required."),
  resources: z.coerce.number().int().min(1, "At least one resource is required."),
});

type Step1Values = z.infer<typeof step1Schema>;

export function SystemConfigForm({ onSetup }: SystemConfigFormProps) {
  const [step, setStep] = useState(1);
  const [dimensions, setDimensions] = useState<{ processes: number; resources: number } | null>(null);

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      processes: 5,
      resources: 3,
    },
  });

  const step2Schema = z.object({
    available: z.array(z.coerce.number().min(0)).length(dimensions?.resources || 0),
    max: z.array(
      z.array(z.coerce.number().min(0)).length(dimensions?.resources || 0)
    ).length(dimensions?.processes || 0),
    allocation: z.array(
      z.array(z.coerce.number().min(0)).length(dimensions?.resources || 0)
    ).length(dimensions?.processes || 0),
  }).refine(data => {
    if(!dimensions) return true;
    for(let i=0; i<dimensions.processes; i++) {
        for(let j=0; j<dimensions.resources; j++) {
            if(data.allocation[i][j] > data.max[i][j]) {
                return false;
            }
        }
    }
    return true;
  }, {
    message: "Allocation cannot exceed Maximum Need for any process.",
    path: ["allocation"],
  });
  
  type Step2Values = z.infer<typeof step2Schema>;

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      available: Array(dimensions?.resources || 0).fill(''),
      max: Array(dimensions?.processes || 0).fill(Array(dimensions?.resources || 0).fill('')),
      allocation: Array(dimensions?.processes || 0).fill(Array(dimensions?.resources || 0).fill('')),
    },
  });

  const { fields: maxFields } = useFieldArray({
    control: step2Form.control,
    name: "max",
  });

  const { fields: allocationFields } = useFieldArray({
    control: step2Form.control,
    name: "allocation",
  });

  const handleStep1Submit = (values: Step1Values) => {
    setDimensions(values);
    step2Form.reset({
      available: Array(values.resources).fill(''),
      max: Array(values.processes).fill(Array(values.resources).fill('')),
      allocation: Array(values.processes).fill(Array(values.resources).fill('')),
    });
    setStep(2);
  };

  const handleStep2Submit = (values: Step2Values) => {
    if (!dimensions) return;

    const need = values.max.map((maxRow, p) =>
      maxRow.map((maxVal, r) => maxVal - values.allocation[p][r])
    );
    
    onSetup({
      ...dimensions,
      ...values,
      need,
    });
  };

  const resourceNames = dimensions ? Array.from({ length: dimensions.resources }, (_, i) => String.fromCharCode(65 + i)) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6"/>
            Initial System Configuration
        </CardTitle>
        <CardDescription>
            {step === 1 ? "Define the number of processes and resources in your system." : "Define the available resources, allocation, and maximum need for each process."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
            <Form {...step1Form}>
          <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
            <FormField
              control={step1Form.control}
              name="processes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Processes</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={step1Form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Resources</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Next</Button>
          </form>
          </Form>
        )}
        {step === 2 && dimensions && (
            <FormProvider {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-8">
            <div>
              <Label className="text-lg font-medium">Available Resources</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                {Array.from({length: dimensions.resources}).map((_, index) => (
                  <FormField
                    key={index}
                    control={step2Form.control}
                    name={`available.${index}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource {resourceNames[index]}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <Label className="text-lg font-medium">Allocation Matrix</Label>
                   <div className="space-y-4 mt-2">
                    {allocationFields.map((field, pIndex) => (
                      <div key={field.id} className="flex items-center gap-4">
                        <Label className="w-20">Process {pIndex}</Label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                          {Array.from({length: dimensions.resources}).map((_, rIndex) => (
                            <FormField
                              key={rIndex}
                              control={step2Form.control}
                              name={`allocation.${pIndex}.${rIndex}` as const}
                              render={({ field }) => (
                                <FormItem>
                                   <FormControl>
                                    <Input type="number" {...field} placeholder={`R${rIndex}`} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium">Maximum Need Matrix</Label>
                   <div className="space-y-4 mt-2">
                    {maxFields.map((field, pIndex) => (
                      <div key={field.id} className="flex items-center gap-4">
                        <Label className="w-20">Process {pIndex}</Label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                          {Array.from({length: dimensions.resources}).map((_, rIndex) => (
                            <FormField
                              key={rIndex}
                              control={step2Form.control}
                              name={`max.${pIndex}.${rIndex}` as const}
                              render={({ field }) => (
                                <FormItem>
                                   <FormControl>
                                    <Input type="number" {...field} placeholder={`R${rIndex}`} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
            {step2Form.formState.errors.allocation && (
                <p className="text-sm font-medium text-destructive">{step2Form.formState.errors.allocation.message}</p>
            )}

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit">
                    <Check className="mr-2 h-4 w-4" />
                    Complete Setup
                </Button>
            </div>
          </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}
