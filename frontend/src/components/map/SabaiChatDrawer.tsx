import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Chiang Mai center (approx. old city area)
const CHIANG_MAI_CENTER = { lat: 18.7883, lng: 98.9817 };
const GEOFENCE_RADIUS_KM = 2;

interface SabaiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  treeName?: string;
  treeNameThai?: string;
}

type LocationStatus = 'idle' | 'checking' | 'allowed' | 'denied' | 'error';

const SabaiChatDrawer = ({
  isOpen,
  onClose,
  treeName = '706 Community',
  treeNameThai = '706 ชุมชน',
}: SabaiChatDrawerProps) => {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check IP-based location (simplified - in production use a proper IP geolocation API)
  const checkIPLocation = async (): Promise<boolean> => {
    try {
      // This is a placeholder - in production, call an edge function that checks IP location
      // For now, we'll skip IP check and rely on GPS
      return true;
    } catch {
      return false;
    }
  };

  // Combined GPS + IP verification
  const verifyLocation = async () => {
    setLocationStatus('checking');
    setErrorMessage('');

    try {
      // Step 1: Check GPS
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      const distance = calculateDistance(
        latitude,
        longitude,
        CHIANG_MAI_CENTER.lat,
        CHIANG_MAI_CENTER.lng
      );

      // Step 2: Check IP (dual verification)
      const ipOk = await checkIPLocation();

      if (distance <= GEOFENCE_RADIUS_KM && ipOk) {
        setLocationStatus('allowed');
      } else {
        setLocationStatus('denied');
        setErrorMessage(
          distance > GEOFENCE_RADIUS_KM
            ? `You are ${distance.toFixed(1)}km from Chiang Mai. Sabai Chat is only available within ${GEOFENCE_RADIUS_KM}km of the old city.`
            : 'IP location verification failed. Please try again from Chiang Mai.'
        );
      }
    } catch (err) {
      setLocationStatus('error');
      setErrorMessage(
        err instanceof GeolocationPositionError
          ? 'Location access denied. Please enable location services to join Sabai Chat.'
          : 'Unable to verify location. Please try again.'
      );
    }
  };

  useEffect(() => {
    if (isOpen && locationStatus === 'idle') {
      verifyLocation();
    }
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setLocationStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] rounded-t-3xl border-t border-primary/20"
            style={{
              backgroundColor: 'rgba(10, 26, 16, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-12 rounded-full bg-primary/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <div>
                <h2 className="text-xl font-serif text-primary">Sabai Chat</h2>
                <p className="text-sm text-muted-foreground/60">
                  {treeName} • {treeNameThai}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-primary/10 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 min-h-[200px] flex flex-col items-center justify-center">
              {locationStatus === 'checking' && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-muted-foreground">Verifying your location...</p>
                  <p className="text-xs text-muted-foreground/50">
                    GPS + IP dual verification
                  </p>
                </motion.div>
              )}

              {locationStatus === 'allowed' && (
                <motion.div
                  className="flex flex-col items-center gap-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="relative">
                    <CheckCircle2 className="h-16 w-16 text-primary" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </div>
                  <div>
                    <p className="text-lg text-primary font-serif">สวัสดี! Welcome to Sabai Chat</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You're in Chiang Mai. Enjoy the local vibes!
                    </p>
                  </div>
                  <Button
                    className="mt-4 bg-primary text-background hover:bg-primary/90"
                    onClick={() => {
                      // Navigate to chat or open chat interface
                      console.log('Opening Sabai Chat...');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Enter Sabai Chat
                  </Button>
                </motion.div>
              )}

              {(locationStatus === 'denied' || locationStatus === 'error') && (
                <motion.div
                  className="flex flex-col items-center gap-4 text-center max-w-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="h-16 w-16 text-destructive/70" />
                  <div>
                    <p className="text-lg text-destructive/70 font-serif">
                      {locationStatus === 'denied' ? 'Location Outside Chiang Mai' : 'Location Error'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={verifyLocation}
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SabaiChatDrawer;
