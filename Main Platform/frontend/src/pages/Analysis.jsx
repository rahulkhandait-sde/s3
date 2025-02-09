import { useState } from "react"

const SchoolAnalysisForm = () => {
  const [formData, setFormData] = useState({
    library_availability: false,
    playground_available: false,
    medical_checkups: false,
    availability_ramps: false,
    availability_of_handrails: false,
    handwash_near_toilet: false,
    drinking_water_available: false,
    drinking_water_functional: false,
    rain_water_harvesting: false,
    handwash_facility_for_meal: false,
    electricity_availability: false,
    approachable_road: false,
    anganwadi_premises: false,
    special_training: false,
    smc_exists: false,
    separate_room_for_hm: false,

    school_type: "",
    anganwadi_worker: "",
    cce_pr: "",
    cce_up: "",
    smdc: "",
    solar: "",
    transport_pr: "",
    building_status: "",

    lowclass: "",
    highclass: "",
    anganwadi_boys: "",
    anganwadi_girls: "",
    instr_days_pr: "",
    instr_days_up: "",
    avg_school_hrs_student_pr: "",
    avg_school_hrs_student_up: "",
    avg_school_hrs_teacher_pr: "",
    avg_school_hrs_teacher_up: "",
    acad_inspections: "",
    crc_coordinator: "",
    block_level_officers: "",
    district_officers: "",
    free_text_books_pr: "",
    free_uniform_pr: "",
    free_text_books_up: "",
    free_uniform_up: "",
    no_building_blocks: "",
    pucca_building_blocks: "",
    boundary_wall: "",
    total_class_rooms: "",
    other_rooms: "",
    classrooms_in_good_condition: "",
    classrooms_needs_minor_repair: "",
    classrooms_needs_major_repair: "",
    total_boys_toilet: "",
    total_boys_func_toilet: "",
    total_girls_toilet: "",
    total_girls_func_toilet: "",
    func_boys_cwsn_friendly: "",
    func_girls_cwsn_friendly: "",
    urinal_boys: "",
    urinal_girls: "",
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [udiseId, setUdiseId] = useState("")
  const [standardizationPercentage, setStandardizationPercentage] = useState("")
  const [googleMapLocation, setGoogleMapLocation] = useState("")
  const [aiMessage, setAiMessage] = useState("")

  const recommendationMessages = {
    electricity_availability:
      "Ensure that the school has a reliable electricity supply to support learning activities.",
    anganwadi_worker_0:
      "Deploy an Anganwadi worker in the school to assist with early childhood education and nutrition programs.",
    highclass: "Increase the number of classes offered in the school to accommodate higher grade levels.",
    psuedocode:
      "Verify and update the unique identification number of the school for proper tracking and documentation.",
    rte_pvt_c0_b:
      "Ensure that pre-primary boys enrolled under RTE in private unaided schools receive necessary support.",
    rte_pvt_c0_g:
      "Ensure that pre-primary girls enrolled under RTE in private unaided schools receive necessary support.",
    rte_pvt_c1_b: "Monitor and support boys enrolled in Class 1 under RTE in private unaided schools.",
    rte_pvt_c1_g: "Monitor and support girls enrolled in Class 1 under RTE in private unaided schools.",
    rte_ews_c11_b: "Provide additional resources for economically weaker section (EWS) boys enrolled in Class 11.",
    rte_ews_c11_g: "Provide additional resources for economically weaker section (EWS) girls enrolled in Class 11.",
    rte_ews_c12_b: "Ensure adequate facilities for EWS boys studying in Class 12.",
    rte_ews_c12_g: "Ensure adequate facilities for EWS girls studying in Class 12.",
    Special_Training: "Arrange special training programs for students who require additional academic support.",
    Text_Books_Received: "Ensure that all students receive textbooks on time for the current academic year.",
    Material_Training: "Provide additional graded supplementary materials to enhance student learning.",
    Acad_Inspections: "Increase the frequency of academic inspections to improve teaching quality.",
    CRC_Coordinator: "Schedule more visits from CRC coordinators to monitor and support schools.",
    Block_Level_Officers: "Encourage regular visits by Block Level Officers (BRC/BEO) to assess school performance.",
    District_Officers:
      "Ensure that district/state-level officers conduct regular evaluations and provide necessary support.",
    SMC_Exists: "Confirm that the School Management Committee (SMC) is actively functioning.",
    SMC_SMDC_Same: "Clarify whether the SMC and SMDC are the same entity and define their roles accordingly.",
    SMDC_Constituted: "Establish a School Management and Development Committee (SMDC) if not already in place.",
    Free_text_books_Pr: "Ensure that all primary school students receive free textbooks as per the scheme.",
    Transport_Pr: "Arrange free transport facilities for primary school students in remote areas.",
    Free_uniform_pr: "Provide free uniforms to primary school students to reduce financial burdens on families.",
    Free_text_books_Up: "Distribute free textbooks to upper primary students on time.",
    Transport_Up: "Ensure transport facilities for upper primary students to improve attendance rates.",
    Free_uniform_Up: "Provide free uniforms for upper primary students to maintain inclusivity.",
    Grants_Receipt: "Ensure that school grant funds are received and utilized effectively.",
    Grants_Expenditure: "Track and optimize expenditure of school grants to enhance educational infrastructure.",
  }

  const getRecommendationMessage = (key) => {
    if (key.startsWith("solar_")) {
      const count = key.split("_")[1]
      return count === "1" ? "" : `Install solar power plants to reduce electricity costs and promote sustainability.`
    }
    if (key.startsWith("anganwadi_worker_")) {
      const count = key.split("_")[2]
      return count === "1"
        ? ""
        : `Deploy ${count} Anganwadi workers in the school for better early childhood education and nutrition programs.`
    }
    return recommendationMessages[key] || "No specific recommendation available."
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch("http://127.0.0.1:9000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server.")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAISubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAiMessage("")

    const data = {
      udise_id: udiseId,
      standardization_percentage: Number.parseFloat(standardizationPercentage),
      google_map_location: googleMapLocation,
    }

    try {
      const response = await fetch("http://localhost:5000/api/school/school-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setAiMessage("Data uploaded successfully!")
        setUdiseId("")
        setStandardizationPercentage("")
        setGoogleMapLocation("")
      } else {
        setAiMessage("Error uploading data. Try again.")
      }
    } catch (error) {
      setAiMessage("Error connecting to the server.")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">School Infrastructure Analysis</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">Binary Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(formData)
              .filter(([_, value]) => typeof value === "boolean")
              .map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input type="checkbox" id={key} name={key} checked={value} onChange={handleChange} className="mr-2" />
                  <label htmlFor={key} className="text-sm">
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Categorical Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "school_type", options: { "1": "Yes", "2": "No", "3": "Unknown" } },
              { name: "anganwadi_worker", options: { "0": "No", "1": "Yes", "2": "Unknown" } },
              { name: "cce_pr", options: { "1": "Yes", "2": "No", "9": "Unknown" } },
              { name: "cce_up", options: { "1": "Yes", "2": "No", "9": "Unknown" } },
              { name: "smdc", options: { "1": "Yes", "2": "No", "3": "Unknown" } },
              { name: "solar", options: { "1": "Yes", "2": "No", "3": "Unknown" } },
              { name: "transport_pr", options: { "0": "No", "1": "Yes", "22": "Unknown" } },
              {
                name: "building_status",
                options: {
                  "1": "Private",
                  "2": "Rented",
                  "3": "Governmental",
                  "4": "Government in rent-free building",
                  "7": "Building under construction",
                  "10": "School running in other department building",
                },
              },
            ].map(({ name, options }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                  {name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                </label>
                <select
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select</option>
                  {Object.entries(options).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Numeric Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(formData)
              .filter(
                ([key, value]) =>
                  typeof value === "string" &&
                  ![
                    "school_type",
                    "anganwadi_worker",
                    "cce_pr",
                    "cce_up",
                    "smdc",
                    "solar",
                    "transport_pr",
                    "building_status",
                  ].includes(key),
              )
              .map(([key, value]) => (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                  </label>
                  <input
                    type="number"
                    id={key}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <ul className="list-disc pl-5">
            {result.recommendations.map((rec, index) => (
              <li key={index}>{getRecommendationMessage(rec)}</li>
            ))}
          </ul>
          <p className="mt-2 font-semibold">Standardization Percentage: {result.standardization_percentage}%</p>
        </div>
      )}

      <div className="mt-8 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload AI Standardization Data</h2>

        <form onSubmit={handleAISubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">UDISE ID</label>
            <input
              type="number"
              value={udiseId}
              onChange={(e) => setUdiseId(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
              placeholder="Enter UDISE ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Standardization Percentage</label>
            <input
              type="number"
              value={standardizationPercentage}
              onChange={(e) => setStandardizationPercentage(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
              placeholder="Enter Percentage"
            />
          </div>


          <div>
            <label className="block text-sm font-medium">Google Map Location</label>
            <input
              type="text"
              value={googleMapLocation}
              onChange={(e) => setGoogleMapLocation(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
              placeholder="Paste Google Map Link"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </form>

        {aiMessage && <p className="text-center text-green-500 mt-3">{aiMessage}</p>}
      </div>
    </div>
  )
}

export default SchoolAnalysisForm

