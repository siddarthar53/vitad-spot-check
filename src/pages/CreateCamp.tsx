import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateCampInline from "./CreateCampInline";

const CreateCamp = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ✅ Open modal on page load
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) navigate("/"); // ✅ close modal → go back to dashboard
      }}
    >
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle>Create New Camp</DialogTitle>
        </DialogHeader>
        <CreateCampInline
          onSuccess={(campId) => {
            setOpen(false);
            navigate(`/camp/${campId}/patients`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCamp;
