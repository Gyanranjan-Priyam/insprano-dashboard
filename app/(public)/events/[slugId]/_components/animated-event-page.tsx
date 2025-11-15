"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { RenderDescription } from "@/components/admin_components/rich-text-editor/RenderDescription";
import { CalendarIcon, TagIcon, FileTextIcon, ImageIcon, UsersIcon, IndianRupee, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Helper function to construct full URL
const getFileUrl = (key: string) => {
  if (!key) return '';
  // If it's already a full URL, return as is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  // Otherwise, construct the full URL
  return `https://registration.t3.storage.dev/${key}`;
};

// Helper function to safely parse JSON content
const parseContent = (content: any) => {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse JSON content:', error);
      // Return a simple text node structure for TipTap
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: content
              }
            ]
          }
        ]
      };
    }
  }
  return content;
};

interface AnimatedEventPageProps {
  event: any;
}

export function AnimatedEventPage({ event }: AnimatedEventPageProps) {
  const heroRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Combine thumbnail and gallery images
  const allImages = [
    ...(event.thumbnailKey ? [event.thumbnailKey] : []),
    ...(event.imageKeys || [])
  ];

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  // Auto slideshow effect
  useEffect(() => {
    if (!isPlaying || allImages.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isPlaying, allImages.length, isPaused]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen  bg-linear-to-br from-background to-muted/30"
    >
      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        className="relative min-h-[700px] bg-linear-to-r from-primary/10 to-primary/5 border-b overflow-hidden"
      >
        {/* Background Image */}
        {event.thumbnailKey && (
          <motion.div 
            className="absolute inset-0 z-0"
            style={{ y, opacity }}
          >
            <Image
              src={getFileUrl(event.thumbnailKey)}
              alt={`${event.title} background`}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          </motion.div>
        )}

        <div className="mx-auto flex flex-col justify-end px-4 py-12 relative z-10 min-h-[700px]">
          {/* All content aligned at the bottom in a single row */}
          <motion.div 
            className="max-w-8xl mx-auto w-full"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8"
              variants={fadeInUp}
            >
              {/* Category */}
              <motion.div 
                className="shrink-0 "
                variants={scaleIn}
              >
                <motion.div 
                  className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-lg font-semibold text-white tracking-wide uppercase">{event.category}</span>
                </motion.div>
              </motion.div>
              
              {/* Event Title in center */}
              <motion.div 
                className="flex-1 text-center mr-20"
                variants={fadeInUp}
              >
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold text-white drop-shadow-2xl leading-tight"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {event.title}
                </motion.h1>
              </motion.div>

              {/* Event Details */}
              <motion.div 
                className="shrink-0"
                variants={staggerContainer}
              >
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3"
                  variants={staggerContainer}
                >
                  <motion.div 
                    className="flex items-center gap-7 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl text-gray-900 shadow-lg"
                    variants={scaleIn}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <div className="text-center flex items-center justify-between gap-7">
                      <div className="font-bold text-xl">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xl text-black font-semibold">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl text-gray-900 shadow-lg"
                    variants={scaleIn}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-center flex items-center gap-6 justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {(event.priceType === "free" || event.price === 0) ? "Free" : `₹${event.price}`}
                      </div>
                      <div className="text-xl text-black font-semibold">Fee</div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl text-gray-900 shadow-lg"
                    variants={scaleIn}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <div className="text-center flex items-center gap-6 justify-between">
                      <div className="font-bold text-xl">Open</div>
                      <div className="text-xl text-black font-semibold">Registration</div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Section */}
      <motion.div 
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Event Description */}
            <motion.div variants={fadeInLeft}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <motion.div>
                  <CardHeader>
                    <CardTitle className="text-2xl">About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <Separator className="mb-4 mt-3"/>
                    <RenderDescription json={parseContent(event.description)} />
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>

            {/* Rules & Guidelines */}
            <motion.div variants={fadeInLeft}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <motion.div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <FileTextIcon className="w-6 h-6" />
                      Rules & Guidelines
                    </CardTitle>
                    <CardDescription>
                      Please read these carefully before registering
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mt-4 mb-5"/>
                  <CardContent>
                    <RenderDescription json={parseContent(event.rules)} />
                  </CardContent>
                  <Separator className=" mt-10"/>

                   <div className="p-5">
                      <h4 className="font-semibold mb-2">Download Rule Book</h4>
                      {event.pdfKey ? (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button variant="outline" size="lg" className="w-full mt-2" asChild>
                            <Link href={getFileUrl(event.pdfKey)} target="_blank" rel="noopener noreferrer">
                              <FileTextIcon className="w-4 h-4 mr-2" />
                              Download PDF Rules
                            </Link>
                          </Button>
                        </motion.div>
                      ) : (
                        <Button variant="outline" size="lg" className="w-full" disabled>
                          <FileTextIcon className="w-4 h-4 mr-2" />
                          No PDF Available
                        </Button>
                      )}
                    </div>

                </motion.div>
              </Card>
            </motion.div>

            {/* Event Media */}
            <motion.div variants={fadeInLeft}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <motion.div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <ImageIcon className="w-6 h-6" />
                      Event Gallery
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          {allImages.length > 0 
                            ? `${allImages.length} image${allImages.length > 1 ? 's' : ''} available`
                            : 'No images available'
                          }
                        </h4>
                        {allImages.length > 1 && (
                          <motion.button
                            onClick={togglePlayPause}
                            className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isPlaying ? (
                              <>
                                <PauseIcon className="w-3 h-3" />
                                <span>Auto</span>
                              </>
                            ) : (
                              <>
                                <PlayIcon className="w-3 h-3" />
                                <span>Manual</span>
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-4 mt-4"/>
                  <CardContent className="space-y-6">
                    {allImages.length > 0 ? (
                      <div>
                        {/* Main Image Display with Animation */}
                        <div 
                          className="relative"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <motion.div 
                            className="aspect-video bg-muted rounded-lg overflow-hidden relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full"
                              >
                                <Image
                                  src={getFileUrl(allImages[currentImageIndex])}
                                  alt={`${event.title} - Image ${currentImageIndex + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  priority
                                />
                              </motion.div>
                            </AnimatePresence>
                          </motion.div>

                          {/* Navigation Arrows - Only show if multiple images */}
                          {allImages.length > 1 && (
                            <>
                              <motion.button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                                onClick={prevImage}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ChevronLeftIcon className="w-5 h-5" />
                              </motion.button>
                              
                              <motion.button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                                onClick={nextImage}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ChevronRightIcon className="w-5 h-5" />
                              </motion.button>
                            </>
                          )}
                        </div>

                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No images available</p>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                   
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Registration Card */}
            <motion.div variants={fadeInRight}>
              <Card className="border-primary/20 hover:shadow-xl transition-all duration-300">
                <motion.div
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-primary">Ready to Join?</CardTitle>
                    <CardDescription>
                      Secure your spot in this amazing event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div 
                      className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {(event.priceType === "free" || event.price === 0) ? "Free" : `₹${event.price}`}
                      </div>
                      <p className="text-sm text-muted-foreground">Registration Fee</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="w-full cursor-pointer">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Register Now
                      </Button>
                    </motion.div>
                    <p className="text-xs text-center text-muted-foreground">
                      Registration closes on event date
                    </p>
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>

            {/* Event Details */}
            <motion.div variants={fadeInRight}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <motion.div
                >
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-block"
                      >
                        <Badge variant="secondary" className="mt-1">
                          {event.category}
                        </Badge>
                      </motion.div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                      <p className="font-medium mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          timeZone: 'UTC',
                          timeZoneName: 'short'
                        })}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                      <motion.div 
                        className="flex items-center gap-2 mt-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <UsersIcon className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {event.teamSize || 4} Members
                        </span>
                      </motion.div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Event ID</p>
                      <motion.p 
                        className="text-xs font-mono mt-1 px-2 py-1 rounded cursor-pointer"
                        whileHover={{ scale: 1.05, backgroundColor: "var(--muted-foreground)" }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-lg">{event.slugId}</span>
                      </motion.p>
                    </div>
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div variants={fadeInRight}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <motion.div
                >
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Have questions about this event? Get in touch with our team.
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="outline" size="lg" className="w-full cursor-pointer">
                        Contact Support
                      </Button>
                    </motion.div>
                  </CardContent>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}