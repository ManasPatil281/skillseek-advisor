import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, MessageCircle, Calendar, MapPin, Briefcase, Users } from "lucide-react";
import { apiService, type Mentor } from "@/services/api";

export default function Mentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("all");
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if we have mentor matching data from recommendations
        const mentorMatchingData = localStorage.getItem('mentorMatchingData');
        
        if (mentorMatchingData) {
          try {
            const { careers, sessionData } = JSON.parse(mentorMatchingData);
            console.log('Using personalized mentor matching for careers:', careers);
            
            // Validate the data
            if (!careers || !Array.isArray(careers) || careers.length === 0) {
              throw new Error('Invalid career data for mentor matching');
            }
            
            // Get mentors for the top career recommendation
            const topCareer = careers[0];
            console.log('Fetching personalized mentors for career:', topCareer.title);

            const response = await apiService.getPersonalizedMentors(topCareer, sessionData || {});

            if (response.error) {
              console.warn('Personalized mentor matching failed:', response.error);
              throw new Error(response.error);
            }

            const mentorsData = response.data?.mentors || [];
            console.log('Received personalized mentors:', mentorsData.length);

            if (mentorsData.length > 0) {
              setMentors(mentorsData);
              setFilteredMentors(mentorsData);
              setIsPersonalized(true);
              // Clear the matching data after successful use
              localStorage.removeItem('mentorMatchingData');
              return;
            } else {
              console.warn('No personalized mentors found, falling back to regular mentors');
              throw new Error('No personalized mentors found');
            }
          } catch (personalizedError) {
            console.error('Error with personalized mentor matching:', personalizedError);
            // Clear invalid data
            localStorage.removeItem('mentorMatchingData');
            // Fall through to regular mentor loading
          }
        }
        
        // Fall back to regular mentor loading
        console.log('Loading regular mentors');
        const response = await apiService.getMentors();
        
        if (response.error) {
          throw new Error(response.error);
        }

        // Handle both direct array and wrapped object responses
        let mentorsData = [];
        if (Array.isArray(response.data)) {
          mentorsData = response.data;
        } else if (response.data?.mentors && Array.isArray(response.data.mentors)) {
          mentorsData = response.data.mentors;
        } else {
          throw new Error('Invalid mentor data format received from server');
        }

        console.log('Loaded regular mentors:', mentorsData.length);
        setMentors(mentorsData);
        setFilteredMentors(mentorsData);
        setIsPersonalized(false);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mentors';
        setError(errorMessage);
        console.error('Error fetching mentors:', err);
        
        // Set empty arrays to prevent further errors
        setMentors([]);
        setFilteredMentors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []);

  useEffect(() => {
    // Ensure mentors is an array before filtering
    if (!Array.isArray(mentors)) {
      console.warn('Mentors is not an array:', mentors);
      setFilteredMentors([]);
      return;
    }

    let filtered = [...mentors]; // Create a copy to avoid mutations

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(mentor => {
        if (!mentor) return false;
        
        const name = mentor.name?.toLowerCase() || '';
        const title = mentor.title?.toLowerCase() || '';
        const company = mentor.company?.toLowerCase() || '';
        const expertise = Array.isArray(mentor.expertise) 
          ? mentor.expertise.some(exp => exp?.toLowerCase().includes(searchLower))
          : false;
        
        return name.includes(searchLower) || 
               title.includes(searchLower) || 
               company.includes(searchLower) || 
               expertise;
      });
    }

    // Filter by expertise
    if (selectedExpertise !== "all") {
      filtered = filtered.filter(mentor => 
        mentor?.expertise && 
        Array.isArray(mentor.expertise) && 
        mentor.expertise.includes(selectedExpertise)
      );
    }

    setFilteredMentors(filtered);
  }, [mentors, searchTerm, selectedExpertise]);

  const renderStars = (rating: number) => {
    const validRating = Math.max(0, Math.min(5, rating || 0)); // Ensure rating is between 0-5
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < validRating ? "text-warning fill-warning" : "text-muted-foreground"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Loading Mentors...</h1>
          <p className="text-muted-foreground mt-2">Finding the best mentors for you</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground">Error Loading Mentors</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <div className="flex gap-4 justify-center mt-4">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('mentorMatchingData');
              window.location.reload();
            }}>
              Load Regular Mentors
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Extract all unique expertise safely
  const allExpertise = Array.isArray(mentors) ? Array.from(
    new Set(
      mentors
        .filter(mentor => mentor?.expertise && Array.isArray(mentor.expertise))
        .flatMap(mentor => mentor.expertise || [])
        .filter(exp => exp && typeof exp === 'string')
    )
  ) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">Find Your Mentor</h1>
        <p className="text-muted-foreground mt-2">
          Connect with experienced professionals who can guide your career journey
        </p>
        {isPersonalized && (
          <Badge className="mt-2 bg-success/10 text-success hover:bg-success/20">
            Personalized Results
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Filter Mentors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, title, company, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                <SelectTrigger>
                  <SelectValue placeholder="All Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expertise</SelectItem>
                  {allExpertise.map((expertise) => (
                    <SelectItem key={expertise} value={expertise}>
                      {expertise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredMentors.length} of {mentors.length} mentors
        {isPersonalized && <span className="text-success"> (Personalized)</span>}
      </div>

      {/* Mentors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(filteredMentors) && filteredMentors.map((mentor) => {
          if (!mentor || !mentor.id) return null;
          
          return (
            <Card key={mentor.id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium">{mentor.name || 'Unknown Name'}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4" />
                      {mentor.title || 'Unknown Title'} at {mentor.company || 'Unknown Company'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(mentor.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({mentor.rating || 0})
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mentor.bio || 'No bio available'}
                </p>

                {/* Expertise */}
                <div>
                  <p className="text-sm font-medium mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 ? (
                      <>
                        {mentor.expertise.slice(0, 3).map((skill, index) => (
                          <Badge key={`${skill}-${index}`} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{mentor.expertise.length - 3} more
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        No expertise listed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{mentor.availability || 'Availability not specified'}</span>
                </div>

                {/* Match Score (if personalized) */}
                {isPersonalized && mentor.match_score && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-success/10 text-success">
                      {mentor.match_score}% Match
                    </Badge>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Array.isArray(filteredMentors) && filteredMentors.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No mentors found</p>
            <p className="text-sm">
              {searchTerm || selectedExpertise !== "all" 
                ? "Try adjusting your search criteria" 
                : "No mentors are currently available"}
            </p>
            {(searchTerm || selectedExpertise !== "all") && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedExpertise("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}