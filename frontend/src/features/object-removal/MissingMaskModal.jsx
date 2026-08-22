import PropTypes from 'prop-types';
import AppModals from '@/shared/components/common/AppModals';
import { makeStorageKeys } from '@/shared/storage/storageKeys';

const storageKeys = makeStorageKeys('objectremove');

/** Render the object-removal validation message for a missing painted mask. */
export default function MissingMaskModal({ appAlert, setAppAlert }) {
  const handleClose = () => {
    setAppAlert({ show: false, type: null });
    localStorage.removeItem(storageKeys.ALERT);
    localStorage.removeItem(`${storageKeys.ALERT}_message`);
    localStorage.removeItem(storageKeys.REFRESH_COUNT);
  };

  return (
    <AppModals
      isOpen={appAlert.show && appAlert.type === 'missing_mask'}
      onClose={handleClose}
      title="Selection Required ✏️"
    >
      <div className="space-y-1.5 text-left">
        <p className="font-semibold text-slate-800 text-base mb-2">
          Please paint the object area first.
        </p>
        <p>
          Object Remove needs a painted mask so PixelForge knows exactly which
          part of the image you want to remove.
        </p>
        <p>
          Use the brush on the preview image, paint over the unwanted object,
          then click <span className="font-semibold">Remove Object</span>{' '}
          again.
        </p>
      </div>
    </AppModals>
  );
}

MissingMaskModal.propTypes = {
  appAlert: PropTypes.object.isRequired,
  setAppAlert: PropTypes.func.isRequired,
};
