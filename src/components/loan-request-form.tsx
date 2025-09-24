"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote, Send } from "lucide-react";
import type { LoanRequest } from "@/lib/types";

interface LoanRequestFormProps {
  processCount: number;
  resourceNames: string[];
  onSubmit: (data: LoanRequest) => void;
  isProcessing: boolean;
}

export function LoanRequestForm({
  processCount,
  resourceNames,
  onSubmit,
  isProcessing,
}: LoanRequestFormProps) {
  const formSchema = z.object({
    processId: z.string().min(1, { message: "Please select a process." }),
    ...Object.fromEntries(
      resourceNames.map((name) => [
        name,
        z.coerce.number().min(0, { message: "Must be non-negative." }),
      ])
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      processId: "",
      ...Object.fromEntries(resourceNames.map((name) => [name, 0])),
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const request: number[] = resourceNames.map((name) => values[name as keyof typeof values]);
    onSubmit({
      processId: parseInt(values.processId),
      request,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-6 w-6"/>
          Request a Loan
        </CardTitle>
        <CardDescription>
          Select a process and enter the amount of resources to request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="processId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Process</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a process to request for" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(processCount).keys()].map((id) => (
                        <SelectItem key={id} value={String(id)}>
                          Process {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {resourceNames.map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource {name}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} disabled={isProcessing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing}>
              <Send className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
