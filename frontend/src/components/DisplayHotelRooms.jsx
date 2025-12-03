import Card from './Card.jsx'

function DisplayHotelRooms({ hotelRoomsData, searchParams }) {
  return (
    <>
      <fieldset className="my-5 w-3xl border border-orange-600 p-4 rounded-lg">
        <legend className="text-lg font-semibold text-orange-600 px-2">
          Hotel Rooms
        </legend>

        <div className="space-y-4">
          <ul>
            {hotelRoomsData.map((room) => (
              <li key={room.id} className="my-5">
                <Card room={room} searchParams={searchParams} />
              </li>
            ))}
          </ul>
        </div>
      </fieldset>
    </>
  )
}

export default DisplayHotelRooms
