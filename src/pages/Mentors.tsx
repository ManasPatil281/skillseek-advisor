import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Star, MessageCircle, Briefcase, Search } from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  experience_years: number;
  rating: number;
  total_sessions: number;
  specialties: string[];
  bio: string;
  avatar?: string;
}

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Software Engineer",
    company: "Google",
    location: "San Francisco, CA",
    experience_years: 8,
    rating: 4.9,
    total_sessions: 127,
    specialties: ["React", "Python", "System Design", "Career Growth"],
    bio: "Passionate about helping new developers navigate their career journey in tech. Specialized in full-stack development and system architecture."
  },
  {
    id: "2", 
    name: "Marcus Johnson",
    title: "Data Science Manager",
    company: "Netflix",
    location: "Los Angeles, CA",
    experience_years: 12,
    rating: 4.8,
    total_sessions: 89,
    specialties: ["Machine Learning", "Python", "Leadership", "Data Strategy"],
    bio: "Leading data science teams to drive business impact through ML. Love mentoring aspiring data scientists and helping them develop both technical and leadership skills."
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    title: "Product Manager",
    company: "Microsoft",
    location: "Seattle, WA", 
    experience_years: 6,
    rating: 4.7,
    total_sessions: 156,
    specialties: ["Product Strategy", "User Research", "Agile", "Stakeholder Management"],
    bio: "Product leader with experience launching consumer and enterprise products. Passionate about user-centered design and data-driven product decisions."
  },
  {
    id: "4",
    name: "David Kim",
    title: "UX Design Director",
    company: "Spotify",
    location: "New York, NY",
    experience_years: 10,
    rating: 4.9,
    total_sessions: 203,
    specialties: ["UI/UX Design", "Design Systems", "User Research", "Creative Leadership"],
    bio: "Design leader focused on creating intuitive user experiences. Enjoy helping designers grow their skills and build impactful products."
  }
];

export default function Mentors() {
  const [mentors] = useState<Mentor[]>(mockMentors);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  // Get all unique specialties for filter
  const allSpecialties = Array.from(
    new Set(mentors.flatMap(mentor => mentor.specialties))
  ).sort();

  // Filter mentors based on search and specialty
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesSpecialty = selectedSpecialty === "all" || 
                            mentor.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-medium text-foreground">Find Your Mentor</h1>
        <p className="text-muted-foreground mt-2">
          Connect with experienced professionals who can guide your career journey
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors by name, title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {allSpecialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMentors.length} of {mentors.length} mentors
        </p>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium truncate">
                    {mentor.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {mentor.title} at {mentor.company}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {mentor.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {mentor.experience_years} years exp
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {mentor.bio}
              </p>

              {/* Specialties */}
              <div>
                <div className="flex flex-wrap gap-2">
                  {mentor.specialties.map((specialty) => (
                    <Badge 
                      key={specialty} 
                      variant="secondary" 
                      className="text-xs bg-muted text-muted-foreground"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning fill-current" />
                    <span className="font-medium">{mentor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{mentor.total_sessions} sessions</span>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMentors.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No mentors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find more mentors.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}