import React, { useEffect, useState } from "react";
import axios from "axios";
// Added a few more icons for the modals
import { Trash2, Plus, AlertTriangle, CheckCircle } from "lucide-react";

const ProductionPlanTable = () => {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    product: "",
    totalStock: "",
    startDate: "",
    endDate: "",
  });

  // State for managing modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch data from backend
  const fetchPlans = async () => {
    try {
      const res = await axios.get("http://localhost:8001/api/product");
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new plan
  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:8001/api/product", form);
      setForm({ product: "", totalStock: "", startDate: "", endDate: "" });
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  // Open the confirmation modal
  const handleDelete = (id, productName) => {
    setSelectedPlan({ id, productName });
    setShowConfirmModal(true);
  };

  // Confirm the deletion
  const confirmDelete = async () => {
    if (!selectedPlan) return;
    try {
      await axios.delete(`http://localhost:8001/api/product/${selectedPlan.id}`);
      fetchPlans();
      setShowConfirmModal(false);
      setSuccessMessage(`Plan for "${selectedPlan.productName}" was deleted successfully.`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error deleting plan:", err);
      setShowConfirmModal(false);
      setSuccessMessage("Failed to delete the plan. Please try again.");
      setShowSuccessModal(true); // Show feedback even on failure
    } finally {
      setSelectedPlan(null);
    }
  };

  // Close the confirmation modal
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setSelectedPlan(null);
  };

  // Close the success/error feedback modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  // ## START: STYLING FIXES & ENHANCEMENTS ##

  // Confirmation Modal Component with improved styling
  const ConfirmModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300
      ${showConfirmModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* ## FIX: Changed from white to a dark, semi-transparent background for a proper overlay effect ## */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>

      {/* ## Modal content with a smooth scale and fade animation ## */}
      <div
        className={`bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300
        ${showConfirmModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Deletion</h3>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete the plan for{" "}
          <span className="font-semibold text-gray-900">"{selectedPlan?.productName}"</span>?
          <br />
          <span className="text-sm text-red-600 mt-2 block">This action cannot be undone.</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={cancelDelete}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Success/Error Modal Component with the same style fixes
  const SuccessModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300
      ${showSuccessModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* ## FIX: Consistent dark, blurred background ## */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>

      {/* ## Consistent animation ## */}
      <div
        className={`bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300
        ${showSuccessModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full ${successMessage.includes("Failed") ? "bg-red-100" : "bg-green-100"}`}>
          {successMessage.includes("Failed") ? (
            <AlertTriangle className="w-8 h-8 text-red-600" />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-600" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {successMessage.includes("Failed") ? "Error" : "Success"}
        </h3>
        <p className={`text-center mb-6 ${successMessage.includes("Failed") ? "text-red-600" : "text-gray-600"}`}>
          {successMessage}
        </p>
        <button
          onClick={closeSuccessModal}
          className="w-full px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
  
  // ## END: STYLING FIXES & ENHANCEMENTS ##

  return (
    <div className="bg-gray-100 min-h-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Production Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and track your production plans efficiently.
          </p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Add New Plan
          </h2>
          <div className="flex flex-wrap items-end gap-4">
            <input
              type="text"
              name="product"
              value={form.product}
              onChange={handleChange}
              placeholder="Product Name"
              className="flex-grow p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
            <input
              type="number"
              name="totalStock"
              value={form.totalStock}
              onChange={handleChange}
              placeholder="Total Stock"
              className="flex-grow p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out flex items-center gap-2"
            >
              <Plus size={18} />
              Add Plan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Units</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Finished</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Remaining</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Left</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Daily Target</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Weekly Target</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-indigo-50/50 transition-colors duration-150">
                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{plan.product}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{plan.totalStock}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{plan.finishedUnits}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{plan.remainingUnits}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(plan.endDate).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{plan.remainingDays} days</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {plan.dailyTarget}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {plan.weeklyTarget}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(plan._id, plan.product)}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-full hover:bg-red-100"
                        aria-label="Delete plan"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Render Modals at the top level of the component */}
      <ConfirmModal />
      <SuccessModal />
    </div>
  );
};

export default ProductionPlanTable;