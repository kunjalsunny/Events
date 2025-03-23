import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Types
interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected";
}

// API Service
const eventsApi = {
  baseUrl: "http://localhost:5000/events",

  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  },

  async getAll() {
    const response = await axios.get(this.baseUrl);
    return response.data;
  },

  async create(eventData: Omit<Event, "id" | "status">) {
    return axios.post(this.baseUrl, eventData, this.getAuthHeaders());
  },

  async updateStatus(id: string, status: "Approved" | "Rejected") {
    return axios.put(
      `${this.baseUrl}/${id}/approve`,
      { status },
      this.getAuthHeaders()
    );
  },
};

// Event Form Component
const EventForm: React.FC<{ onEventSubmit: () => void }> = ({
  onEventSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await eventsApi.create(formData);
      setFormData({
        title: "",
        date: "",
        time: "",
        venue: "",
        description: "",
      });
      onEventSubmit();
    } catch (error: any) {
      alert(error.response?.data?.error || "Event submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Enter venue"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Event List Component
const EventList: React.FC<{
  events: Event[];
  userRole: string | null;
  onUpdateStatus: (
    id: string,
    status: "Approved" | "Rejected"
  ) => Promise<void>;
}> = ({ events, userRole, onUpdateStatus }) => {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatEventDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    return timeString ? `${formattedDate} • ${timeString}` : formattedDate;
  };

  const getStatusBadgeColor = (status: Event["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredEvents = events.filter((event) => {
    // First apply tab filter
    if (filter === "upcoming" && new Date(event.date) < new Date())
      return false;
    if (filter === "past" && new Date(event.date) >= new Date()) return false;

    // Then apply search filter
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Event List</CardTitle>
      </CardHeader>

      <Tabs
        defaultValue="all"
        onValueChange={(value) => setFilter(value as any)}
      >
        <TabsList>
          <TabsTrigger value="all">
            All{" "}
            <Badge variant="secondary" className="ml-1">
              {events.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming{" "}
            <Badge variant="secondary" className="ml-1">
              {events.filter((e) => new Date(e.date) >= new Date()).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past">
            Past{" "}
            <Badge variant="secondary" className="ml-1">
              {events.filter((e) => new Date(e.date) < new Date()).length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative mt-4 mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found</div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="border-l-4 border-l-purple-600">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      Date: {formatEventDate(event.date, event.time)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Venue: {event.venue}
                    </p>
                    {event.description && (
                      <p className="text-sm mt-2">{event.description}</p>
                    )}
                  </div>
                  <Badge className={getStatusBadgeColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>

                {userRole === "admin" && event.status === "Pending" && (
                  <div className="mt-4 flex space-x-2 justify-end">
                    <Button
                      onClick={() => onUpdateStatus(event.id, "Approved")}
                      variant="secondary"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => onUpdateStatus(event.id, "Rejected")}
                      variant="destructive"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Main Component
const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = localStorage.getItem("role");

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await eventsApi.updateStatus(id, status);
      fetchEvents();
    } catch (error) {
      console.error("Failed to update event status:", error);
      alert("Failed to update event status");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12">Loading events...</div>;
  }

  return (
    <div className="p-6 ">
      <div className="w grid grid-cols-1gap-6">
        {userRole === "student" && (
          <div>
            <EventForm onEventSubmit={fetchEvents} />
          </div>
        )}

        <div
          className={userRole === "student" ? "md:col-span-1" : "md:col-span-2"}
        >
          <Card>
            <CardContent className="p-6">
              <EventList
                events={events}
                userRole={userRole}
                onUpdateStatus={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Events;
