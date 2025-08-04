export default function EventHallCard({ eventHall }) {
    return (
        <div className="bg-white overflow-hidden h-full flex flex-col">
            {eventHall.image && (
                <div className="relative aspect-square overflow-hidden">
                    <img
                        src={eventHall.image}
                        alt={eventHall.altText}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
                {eventHall.title && (
                    <h3 className="text-[30px] font-medium text-[#3D3D3F] mb-2 leading-[1.1]">
                        {eventHall.title}
                    </h3>
                )}
                {eventHall.size && (
                    <div className="flex items-center text-[25px] gap-2 text-[#636363] mb-4">
                        <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5005 13.94C12.3963 13.94 12.2924 13.9174 12.1959 13.8725L1.39591 8.83254C1.14247 8.71446 0.980469 8.45982 0.980469 8.17998C0.980469 7.90014 1.14247 7.6455 1.39591 7.52742L12.1959 2.48742C12.3886 2.39742 12.6121 2.39742 12.8048 2.48742L23.6048 7.52742C23.8585 7.6455 24.0205 7.90014 24.0205 8.17998C24.0205 8.45982 23.8585 8.71446 23.605 8.83254L12.805 13.8725C12.7085 13.9174 12.6046 13.94 12.5005 13.94ZM3.40303 8.17998L12.5005 12.4253L21.5979 8.17998L12.5005 3.93462L3.40303 8.17998ZM12.805 18.1925L23.605 13.1525C23.9653 12.9845 24.121 12.5557 23.953 12.1957C23.7845 11.8357 23.3561 11.6797 22.9961 11.8477L12.5005 16.7453L2.00503 11.8474C1.64431 11.6794 1.21639 11.8354 1.04815 12.1954C0.880149 12.5554 1.03591 12.9843 1.39615 13.1523L12.1961 18.1923C12.2924 18.2374 12.3963 18.26 12.5005 18.26C12.6046 18.26 12.7085 18.2374 12.805 18.1925ZM12.805 22.5125L23.605 17.4725C23.9653 17.3045 24.121 16.8757 23.953 16.5157C23.7845 16.1564 23.3561 16.0004 22.9961 16.1677L12.5005 21.0653L2.00503 16.1674C1.64431 16.0001 1.21639 16.1561 1.04815 16.5154C0.880149 16.8754 1.03591 17.3043 1.39615 17.4723L12.1961 22.5123C12.2924 22.5574 12.3963 22.58 12.5005 22.58C12.6046 22.58 12.7085 22.5574 12.805 22.5125Z" fill="#636363"/>
                        </svg>
                        <span>{eventHall.size}</span>
                    </div>
                )}
                {eventHall.tags && eventHall.tags.length > 0 && (
                    <div className="flex flex-wrap gap-[10px] mt-auto">
                        {eventHall.tags.map((tag, tagIndex) => (
                            <span
                                key={tagIndex}
                                className="px-[20px] py-[2px] bg-[#F4F4F4] text-[#3D3D3F] text-[18px] rounded-full font-normal"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
