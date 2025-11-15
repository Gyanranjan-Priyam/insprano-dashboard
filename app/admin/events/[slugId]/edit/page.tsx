"use client";

import { RichTextEditor } from "@/components/admin_components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventCategories, eventSchema, EventSchemaType } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CalendarIcon, Loader2, SaveIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { Uploader } from "@/components/file-uploader/Uploader";
import { MultipleUploader } from "@/components/file-uploader/MultipleUploader";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getEventBySlugId, updateEventAction } from "./action";

export default function EventEditPage({ params }: { params: Promise<{ slugId: string }> }) {
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [slugId, setSlugId] = useState<string>("");
  const router = useRouter();

  const form = useForm<EventSchemaType>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: "",
      slugId: "",
      description: "",
      rules: "",
      thumbnailKey: "",
      pdfKey: "",
      imageKeys: [],
      priceType: "free",
      price: 0,
      venue: "",
      date: new Date(),
      category: "OtherEvent",
      teamSize: 4,
    },
  });

  // Load event data
  useEffect(() => {
    async function loadEvent() {
      try {
        const resolvedParams = await params;
        setSlugId(resolvedParams.slugId);
        
        const { data: result, error } = await tryCatch(getEventBySlugId(resolvedParams.slugId));
        if (error || !result || result.status === "error") {
          toast.error('Failed to load event data');
          return;
        }

        const event = result.data;
        if (!event) {
          toast.error('Event not found');
          return;
        }

        // Populate form with existing data
        form.reset({
          title: event.title,
          slugId: event.slugId,
          description: event.description,
          rules: event.rules,
          thumbnailKey: event.thumbnailKey,
          pdfKey: event.pdfKey,
          imageKeys: event.imageKeys || [],
          priceType: event.priceType || "free", // Use the actual priceType field
          price: event.price,
          venue: event.venue,
          date: new Date(event.date),
          category: event.category,
          teamSize: event.teamSize || 4,
        });
      } catch (error) {
        toast.error('Failed to load event data');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [params, form]);

  function onSubmit(values: EventSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(updateEventAction(slugId, values));
      if (error) {
        toast.error("Error updating event: " + error.message);
        return;
      }
      
      if (result?.status === "success") {
        toast.success(result.message);
        router.push(`/admin/events/${slugId}`);
      } else {
        toast.error(result?.message || "Failed to update event");
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold">Edit Event</h1>
          <p className="mt-1 md:mt-2 text-sm text-muted-foreground">
            Update the event details below.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="space-y-4 md:space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-4 sm:gap-10">
                <FormField
                  control={form.control as any}
                  name="slugId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input className="mt-2" {...field} placeholder="Slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  className="w-full sm:w-fit mt-0 sm:mt-7 shrink-0"
                  onClick={() => {
                    const titleValue = form.getValues("title");
                    const slug = slugify(titleValue);
                    form.setValue("slugId", slug, { shouldValidate: true });
                  }}
                >
                  Generate Slug <SparkleIcon className="ml-1" size={16} />
                </Button>
              </div>
              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rules</FormLabel>
                    <FormControl>
                      <RichTextEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="thumbnailKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                        <Uploader onChange={field.onChange} value={field.value} fileTypeAccepted="image"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="pdfKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Rule Book</FormLabel>
                    <FormControl>
                        <Uploader onChange={field.onChange} value={field.value} fileTypeAccepted="pdf"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="imageKeys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Images</FormLabel>
                    <FormControl>
                        <MultipleUploader 
                          onChange={field.onChange} 
                          value={field.value} 
                          maxFiles={10}
                          minFiles={1}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <FormField
                  control={form.control as any}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mt-2">Venue</FormLabel>
                      <FormControl>
                        <Input
                          className="mt-2.5"
                          placeholder="Enter venue"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="priceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "free") {
                            form.setValue("price", 0);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Select price type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free Event</SelectItem>
                          <SelectItem value="paid">Paid Event</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("priceType") === "paid" && (
                  <FormField
                    control={form.control as any}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mt-2">Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="mt-2.5"
                            placeholder="Enter price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control as any}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mt-2">Team Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          className="mt-2.5"
                          placeholder="Max team members"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          value={field.value || 4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mt-2">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal mt-2.5",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" asChild className="w-full sm:w-auto order-2 sm:order-1">
                  <Link href={slugId ? `/admin/events/${slugId}` : '/admin/events'}>
                    Cancel
                  </Link>
                </Button>
                <Button type="submit" disabled={pending} className="w-full sm:w-auto order-1 sm:order-2">
                {pending ? (
                  <>
                    Saving....
                    <Loader2 className="animate-spin ml-1" />
                  </>
                ) : (
                  <>
                    Save Changes <SaveIcon className="ml-1 size-4" />
                  </>
                )}
              </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}