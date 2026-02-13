import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Supabase import
import { cn } from '../../lib/utils';
import { Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface StreamingService {
  id: string;
  name: string;
}

const streamingServiceColors: Record<string, { border: string; bg: string; text: string }> = {
  'Netflix': {
    border: 'border-red-600',
    bg: 'bg-red-50',
    text: 'text-red-600'
  },
  'Disney+': {
    border: 'border-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600'
  },
  'Hulu': {
    border: 'border-green-600',
    bg: 'bg-green-50',
    text: 'text-green-600'
  },
  'Max': {
    border: 'border-purple-600',
    bg: 'bg-purple-50',
    text: 'text-purple-600'
  },
  'Prime Video': {
    border: 'border-sky-600',
    bg: 'bg-sky-50',
    text: 'text-sky-600'
  },
  'Peacock': {
    border: 'border-orange-600',
    bg: 'bg-orange-50',
    text: 'text-orange-600'
  },
  'Apple TV+': {
    border: 'border-gray-900',
    bg: 'bg-gray-50',
    text: 'text-gray-900'
  }
};

export function StreamingServiceSelection() {
  const navigate = useNavigate();
  const [services, setServices] = useState<StreamingService[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [includeRentals, setIncludeRentals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        // Mock user - get from context instead
        const user = { id: 'dev-user-1' };
        const userError = null;
        if (userError) throw userError;
        if (!user?.id) throw new Error('No authenticated user found');

        // Load available streaming services
        const { data: servicesData, error: servicesError } = await supabase
          .from('streaming_services')
          .select('*')
          .order('name');

        if (servicesError) throw servicesError;
        if (!servicesData) throw new Error('No streaming services found');

        // Load user's selected services
        const { data: userServices, error: userServicesError } = await supabase
          .from('user_streaming_services')
          .select('service_id')
          .eq('user_id', user.id);

        if (userServicesError) throw userServicesError;

        // Load user's rental preference
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('include_rentals')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        setServices(servicesData);
        setSelectedServices(userServices?.map(us => us.service_id) || []);
        setIncludeRentals(profileData?.include_rentals ?? false);
      } catch (err) {
        console.error('Error loading services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load streaming services. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  useEffect(() => {
    if (selectedServices.length > 0 || includeRentals) {
      setValidationError(null);
    }
  }, [selectedServices, includeRentals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length === 0 && !includeRentals) {
      setValidationError('Please select at least one streaming service or include rentable movies');
      return;
    }

    setSaving(true);
    setError(null);
    setValidationError(null);

    try {
      // Mock user - get from context instead
      const user = { id: 'dev-user-1' };
      const userError = null;
      if (userError) throw userError;
      if (!user?.id) throw new Error('No authenticated user found');

      // Delete existing selections
      const { error: deleteError } = await supabase
        .from('user_streaming_services')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Insert new selections if any are selected
      if (selectedServices.length > 0) {
        const { error: insertError } = await supabase
          .from('user_streaming_services')
          .insert(
            selectedServices.map(serviceId => ({
              user_id: user.id,
              service_id: serviceId
            }))
          );

        if (insertError) throw insertError;
      }

      // Update rental preference
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ include_rentals: includeRentals })
        .eq('id', user.id);

      if (updateError) throw updateError;

      navigate('/conversation');
    } catch (err) {
      console.error('Error saving services:', err);
      setError(err instanceof Error ? err.message : 'Failed to save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="py-6 px-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-indigo-600">MovieMe</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Select Your Streaming Services
          </h2>
          <p className="text-gray-600 mb-8">
            Before we get started, let's make sure I only recommend movies you can actually watch! 
            Select the streaming services you have access to.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                const colors = streamingServiceColors[service.name] || {
                  border: 'border-gray-200',
                  bg: 'bg-gray-50',
                  text: 'text-gray-600'
                };

                return (
                  <label
                    key={service.id}
                    className={cn(
                      "relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                      "hover:bg-gray-50",
                      isSelected
                        ? cn(colors.border, colors.bg)
                        : "border-gray-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, service.id]);
                        } else {
                          setSelectedServices(selectedServices.filter(id => id !== service.id));
                        }
                      }}
                    />
                    <span className={cn(
                      "flex-1",
                      isSelected ? colors.text : "text-gray-900"
                    )}>
                      {service.name}
                    </span>
                    {isSelected && (
                      <Check className={cn("h-5 w-5 ml-2", colors.text)} />
                    )}
                  </label>
                );
              })}
            </div>

            <label className={cn(
              "relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors",
              "hover:bg-indigo-50",
              includeRentals ? "border-indigo-600 bg-indigo-50" : "border-gray-200"
            )}>
              <input
                type="checkbox"
                className="sr-only"
                checked={includeRentals}
                onChange={(e) => setIncludeRentals(e.target.checked)}
              />
              <div className="flex-1">
                <span className="font-medium">Include rentable movies</span>
                <p className="text-sm text-gray-500 mt-1">
                  Show movies available for rent on YouTube, Amazon Prime, or Vudu
                </p>
              </div>
              {includeRentals && <Check className="h-5 w-5 text-indigo-600 ml-2" />}
            </label>

            {(error || validationError) && (
              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  {error || validationError}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={cn(
                "w-full py-3 px-4 rounded-lg text-white font-medium",
                "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                "transition-colors duration-200",
                saving && "opacity-50 cursor-not-allowed"
              )}
            >
              {saving ? 'Saving...' : 'Continue to Movie Discovery'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}